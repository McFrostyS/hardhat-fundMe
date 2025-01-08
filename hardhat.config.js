require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()
require('@nomicfoundation/hardhat-verify')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('hardhat-deploy')

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'http://eth-sepolia'
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || '0xKey'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || 'key'
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || 'key'

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  // solidity: '0.8.8',
  solidity: {
    compilers: [{ version: '0.8.8' }, { version: '0.8.0' }],
  },
  defaultNetwork: 'hardhat',
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 6,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-report.txt',
    noColors: true,
    currency: 'USD',
    coinmarketcap: COINMARKETCAP_API_KEY,
    L1Etherscan: ETHERSCAN_API_KEY,
    L1: 'ethereum', // L1 chain (default is ethereum)
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
}
