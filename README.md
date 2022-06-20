# Lottery Game
This repo contains an example project of a **lottery dApp**. The project was developed for Cadena's Ethereum 101 course and is for educational purposes only.

#### Frontend Stack
- React
- Milligram CSS
- ethers.js
#### Backend Stack
- Solidity
- hardhat



## Smart contract
The smart contract store different data
```js
uint256 private currentId;
mapping(uint256 => Game) private games;
mapping(uint256 => mapping(address => bool)) private uniquePlayers;
address private owner;
```

- **currentId**: id of the latest created games
- **games**: list of all games (ref. to Game struct, below)
- **uniquePlayers**: address list of unique player for a single game
- **owner**: address of the owner

There is one struct called **Game** that describe a single lottery data.
```js
struct Game {
    uint256 id;
    address[] players;
    uint256 price;
    uint256 total;
    address winner;
    bool hasWinner;
    uint256 endDate;
}
```

#### Create Game
```js
function createGame(uint256 _price, uint256 _seconds) payable public onlyOwner {
    require(_price > 0, "Ticket price must be greater than zero");
    require(_seconds > 0, "Game time must be greater than zero");
    Game memory newGame = Game({
        id: currentId,
        players: new address[](0),
        total: 0,
        price: _price,
        winner: address(0),
        hasWinner: false,
        endDate: block.timestamp + _seconds * 1 seconds
    });

    games[currentId] = newGame;
    currentId++;
}
```

The function receives the ticket price and duration (in seconds) as input and creates the new game. Function is marked as `payable` and has the modifier `onlyOwner`.

#### Take Part
```js
function takePart(uint256 _gameId) public payable {
    Game storage game = games[_gameId];
    require(block.timestamp < game.endDate, "Game is already complete");
    require(game.price == msg.value, "Value must be equal to ticket price");
    
    game.players.push(msg.sender);
    game.total += msg.value;
    bool alreadyTakePart = uniquePlayers[_gameId][msg.sender];
    // Player can only take part 1 time
    if (alreadyTakePart == false) {
        uniquePlayers[_gameId][msg.sender] = true;
    }
}
```

The function receives the id of the game you want to participate in. Check that the game has not already finished and that the `msg.value` is equal to the ticket price. If this is the first time the address has participated, it is set to `true` in the `uniquePlayers` structure. Function is marked as `payable`.

#### Pick Winner
```js
function pickWinner(uint256 _gameId) public onlyOwner {
    Game storage game = games[_gameId];
    require(block.timestamp < game.endDate, "Game is already complete");
    require(!game.hasWinner, "Game has already a winner");
    if (game.players.length == 1) {
        require(game.players[0] != address(0), "There are no players in this game");
        game.winner = game.players[0];
        game.hasWinner = true;
        (bool success, ) = game.winner.call{value: game.total}("");
        require(success, "Transfer failed");
    } else {
        uint256 winner = random(game.players) % game.players.length;
        game.winner = game.players[winner];
        game.hasWinner = true;
        (bool success, ) = game.winner.call{value: game.total }("");
        require(success, "Transfer failed");
    }
}
```

The function receives the id of the game whose winner you want to choose. If there was only one participant, the lottery `total` is turned over to his address. If there are more than 1 participants, a winner is chosen randomly. Function has the modifier `onlyOwner`.
#### About randomness
The generated number is pseudo-random and, in a real context, it should be done using an oracle (e.g. chainlink VRF).
