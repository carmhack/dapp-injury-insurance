const { ethers } = require("hardhat");
const { networkConfig } = require('../helper-hardhat-config');
const { config } = require("../chainlink.config");

module.exports = async({
  getNamedAccounts,
  deployments,
  getChainId,
  ethers
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const linkTokenAddress = config[chainId].linkToken;
  const vrfCoordinatorAddress = config[chainId].vrfCoordinator;
  const keyHash = config[chainId].keyHash;
  const fee = config[chainId].fee;

  log("-----------------");
  const Lottery = await deploy('LotteryGame', {
    from: deployer,
    args: [
      vrfCoordinatorAddress,
      linkTokenAddress,
      keyHash,
      ethers.utils.parseUnits(fee, 18)
    ],
    log: true
  });
  const networkName = networkConfig[chainId]['name'];

  log(`Deployed contract at address: ${Lottery.address}`);
  log(`Deployer: ${deployer}`);
  
  log(`Fund contract with LINK:\n`);
  log(`npx hardhat fund-link --contract ${Lottery.address} --fundamount 2000000000000000000 --network ${networkName}`);
  
  log(`Verify with: \n`);
  log(`npx hardhat verify --network ${networkName} ${Lottery.address}`);
}