//require("@nomicfoundation/hardhat-toolbox");

require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28", 
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true // Enable IR optimizer
    }
  }, 

  networks: {
    volta: {
      url: process.env.API_URL,
      accounts: [process.env.PRIVATE_KEY, process.env.ADMIN_PRIVATE_KEY],
      chainId: 73799, // Volta Testnet Chain ID
    },
  },
};