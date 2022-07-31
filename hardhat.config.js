require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const RINKEBY_URL = process.env.RINKEBY_RPC_URL || ""
const PRIVATE_KEE = process.env.PRIVATE_KEE || ""
const ETHERSCAN = process.env.ETHERSCAN_KEY || ""
const COINMARKETCAP_API = process.env.COINMARKETCAP_API || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.8",
      },
      {
        version: "0.6.0",
      },
    ],
  },
  // defaultNetwork: "rinkeby",
  networks: {
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [PRIVATE_KEE],
      chainId: 4,
      blockConfirmations: 6,
      gasPrice: "auto",
      gasLimit: "1763700000000000",
      // accounts: [PRIVATE_KEE],
      blockConfirmations: 6
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN,
  },
  gasReporter: {
    enabled: true,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API,
    token: "matic",
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    user: {
      default: 1,
    },
  },
}
