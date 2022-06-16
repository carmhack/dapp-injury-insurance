//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "hardhat/console.sol";

/*
Deployed at 0x75a5f2d25e3885ecde76f5327f423ec228d11c06
https://rinkeby.etherscan.io/address/0x75a5f2d25e3885ecde76f5327f423ec228d11c06
*/
contract LotteryGame is VRFConsumerBase {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    struct Game {
        uint256 id;
        address[] players;
        uint256 price;
        uint256 total;
        address winner;
        bool hasWinner;
        uint256 endDate;
    }

    Counters.Counter private currentId;
    mapping(uint256 => Game) private games;
    mapping(uint256 => uint256) playersCount;
    mapping(bytes32 => uint256) private randomnessReq;
    bytes32 private keyHash;
    uint256 private fee;
    address private owner;

    constructor(
        address vrfCoordinator, 
        address link, 
        bytes32 _keyHash, 
        uint256 _fee
    ) VRFConsumerBase(vrfCoordinator, link) {
        keyHash = _keyHash;
        fee = _fee;
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function createGame(uint256 _price, uint256 _seconds) payable public onlyOwner {
        require(_price > 0, "Ticket price must be greater than zero");
        require(_seconds > 0, "Game time must be greater than zero");
        Game memory newGame = Game({
            id: currentId.current(),
            players: new address[](0),
            total: 0,
            price: _price,
            winner: address(0),
            hasWinner: false,
            endDate: block.timestamp + _seconds * 1 seconds
        });

        games[currentId.current()] = newGame;
        currentId.increment();
    }

    function takePart(uint256 _gameId) public payable {
        Game storage game = games[_gameId];
        require(block.timestamp < game.endDate, "Game is already complete");
        require(game.price == msg.value, "Value must be equal to ticket price");
        
        game.players.push(msg.sender);
        game.total += msg.value;
    }

    function pickWinner(uint256 _gameId) public onlyOwner {
        Game storage game = games[_gameId];
        require(block.timestamp < game.endDate, "Game is already complete");
        require(!game.hasWinner, "Game has already a winner");
        if (playersCount[_gameId] == 1) {
            require(game.players[0] != address(0), "There are no players in this game");
            game.winner = game.players[0];
            game.hasWinner = true;
            (bool success, ) = game.winner.call{value: game.total}("");
            require(success, "Transfer failed");
        } else {
            require(LINK.balanceOf(address(this)) >= fee, "Not enough LINK");
            bytes32 requestId = requestRandomness(keyHash, fee);
            randomnessReq[requestId] = _gameId;
        }
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 _gameId = randomnessReq[requestId];
        Game storage game = games[_gameId];
        uint256 winner = randomness.mod(game.players.length);
        game.hasWinner = true;
        game.winner = game.players[winner];
        delete randomnessReq[requestId];
        delete playersCount[_gameId];
        (bool success, ) = game.winner.call{value: game.total }("");
        require(success, "Transfer failed");
    }

    function getGame(uint256 _gameId) public view returns (Game memory) {
        return games[_gameId];
    }

    function getGamesCount() public view returns(uint256) {
        return currentId.current();
    }
}