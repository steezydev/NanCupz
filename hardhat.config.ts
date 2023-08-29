import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import { config as dotEnvConfig } from "dotenv";
dotEnvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    testnet: {
      url: process.env.NETWORK_TESTNET_URL!,
      accounts: [process.env.NETWORK_TESTNET_PRIVATE_KEY!],
    },
    mainnet: {
      url: process.env.NETWORK_MAINNET_URL!,
      accounts: [process.env.NETWORK_MAINNET_PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: process.env.BLOCK_EXPLORER_API_KEY,
  },
};

export default config;
