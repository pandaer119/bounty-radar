import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    version: "0.8.36",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
});
