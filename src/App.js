import { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import Lottery from "./artifacts/contracts/Lottery.sol/LotteryGame.json";
import "./App.css";

function App() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState(null);

  const contractAddress = "0x75a5f2d25e3885ecde76f5327f423ec228d11c06";
  const abi = Lottery.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        setIsWalletConnected(true);
        setAddress(accounts[0]);
        console.log("Account Connected: ", accounts[0]);
      } else {
        setError("Please install a MetaMask wallet to use our bank.");
        console.log("No Metamask detected");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const createGame = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const LotteryContract = new ethers.Contract(contractAddress, abi, signer);

        const tx = await LotteryContract.createGame(
          utils.parseEther("0.001"),
          5 * 24 * 60 * 60
        );
        await tx.wait();
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div>
      <main className="container">
        <section>
          <h1>Lottery Game</h1>
        </section>

        <section className="games">
          <h2>Current game</h2>
          <p>aef</p>
        </section>
      </main>
    </div>
  );
}

export default App;
