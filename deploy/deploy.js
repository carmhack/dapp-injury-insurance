const { ethers } = require("hardhat");
const { networkConfig } = require('../helper-hardhat-config');

module.exports = async({
  getNamedAccounts,
  deployments,
  getChainId,
  ethers
}) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  log("-----------------");
  const Lottery = await deploy('LotteryGame', {
    from: deployer,
    log: true
  });
  const networkName = networkConfig[chainId]['name'];

  log(`Deployed contract at address: ${Lottery.address}`);
  log(`Deployer: ${deployer}`);
  
  log(`Verify with: \n`);
  log(`npx hardhat verify --network ${networkName} ${Lottery.address}`);
}