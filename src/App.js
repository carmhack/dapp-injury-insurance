import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import Lottery from "./artifacts/contracts/Lottery.sol/LotteryGame.json";
import "./App.css";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [address, setAddress] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [game, setGame] = useState(null);
  const [contract, setContract] = useState(null);

  const DAYS = 3;
  const contractAddress = "0x2FA70990b49cb4d689201Bafb205DDfE12f57B49";
  const abi = Lottery.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setIsWalletConnected(true);
        setAddress(accounts[0]);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, abi, signer);
        setContract(LotteryContract);
        const ownerAddress = await LotteryContract.getOwner();
        setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());
      } else {
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const createGame = async () => {
    try {
      if (window.ethereum && contract) {
        const tx = await contract.createGame(
          utils.parseEther("0.0001"),
          DAYS * 24 * 3600
        );
        await tx.wait();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getGameInfo = async () => {
    // Get currentId
    const responseID = await contract.getGamesCount();
    const gamesCount = responseID.toNumber() - 1; // BigNumber conversion
    setCurrentId(gamesCount);

    // Get current game
    const {
      price, players, total, 
      winner, hasWinner, endDate
    } = await contract.getGame(gamesCount);

    const priceInEther = utils.formatEther(price.toNumber());
    const totalInEther = utils.formatEther(total.toNumber());
    const endDateMillis = endDate.toNumber() * 1000;

    const myGame = {
      id: gamesCount,
      players,
      price: priceInEther,
      total: totalInEther,
      winner: winner.toString(),
      hasWinner,
      endDate: endDateMillis,
    };
    
    setGame(myGame);
  }

  const takePart = async () => {
    try {
      if (window.ethereum && contract) {
        const ticketPrice = utils.parseEther(game.price);
        const tx = await contract.takePart(currentId, { value: ticketPrice });
        await tx.wait();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const getCurrentGame = async () => {
    try {
      if (window.ethereum && contract) {
        await getGameInfo();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    getCurrentGame();
  }, [contract]);

  return (
    <div>
      <main className="container">
        <section className="header">
          <h1>Lottery Game</h1>
          <h3>Take part in a game and get a chance to win a mountain of money</h3>
          { isOwner && <button className="button" onClick={createGame}>Create game</button>}
        </section>

        {
          contract && game && (
            <section className="lottery">
              <h2>Current Game</h2>
              <h3>ends on {new Date(game.endDate).toLocaleDateString()}</h3>
              <div className="stats">
                <div className="stat">
                  Final prize
                  <span>{game.total} ether</span>
                </div>
                <div className="stat">
                  Ticket price
                  <span>{game.price} ether</span>
                </div>
                <div className="stat">
                  Players
                  <span>{game.players.length}</span>
                </div>
              </div>
              <button className="button" onClick={takePart}>Take part</button>
            </section>
          )
        }
      </main>
    </div>
  );
}

export default App;
