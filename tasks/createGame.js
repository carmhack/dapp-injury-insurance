task("create", "Create game")
.addParam("contract", "Contract address")
.addParam("seconds", "Game duration in seconds")
.addParam("price", "Game ticket price in wei")
.setAction(async (taskArgs) => {
  const address = taskArgs.contract;
  const GameContract = await ethers.getContractFactory("LotteryGame");
  const [deployer] = await ethers.getSigners();
  const contract = new ethers.Contract(
    address,
    GameContract.interface,
    deployer
  );
  const tx = await contract.createGame(
    ethers.utils.parseEther(taskArgs.price),
    parseInt(taskArgs.seconds),
  );
  await tx.wait();
  console.log("Transaction Mined");
});

module.exports = {};