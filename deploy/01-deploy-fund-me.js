// import
// main function
// calling of main fuction

// function deployFunc() {
// console.log("hoge")
// hre.getNameAccounts()
// hre.deployments()
// }

// module.exports.default = deployFunc

// module.exports = async (hre) => {
// const { getNamedAccounts, deployments } = hre
// this is just to pull all the variables out of hre
// hre.getnamedAccounts
// hre.deployments
// }

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  const {verify } = require("../utils/verify")
  let ethUsdPriceFeedAddress

  // if chainId is X then Y
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await deployments.get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    console.log(typeof networkConfig)
    console.log(typeof chainId)
    ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    console.log(ethUsdPriceFeedAddress)
  }

  console.log(deployer)
  const args=[ethUsdPriceFeedAddress]
  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
    // we need to wait if on a live network so we can verify properly
    waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

  if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_KEY) {
    await verify(fundMe.address, args)
  }

}

module.exports.tags = ["all", "fundme"]
