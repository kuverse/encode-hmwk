import { task } from "hardhat/config";
import { parseEther } from "viem";
import * as dotenv from "dotenv";
dotenv.config();
import {
  abi,
} from "../artifacts/contracts/MyERC20Vote.sol/MyToken.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";

export default task("mint-tokens", "Mint tokens to the MyERC20Vote contract")
  .addPositionalParam("mintAmount", "Amount of tokens to mint in ETH")
  .setAction(async (taskArgs) => {
    try {
      const { publicClient, walletClient, account } = setupClients();

      const contractAddress = contractConfig.MyERC20Vote_address;
      if (!contractAddress) {
        throw new Error("Token contract address not found in config");
      }

      console.log("Minting tokens...");
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "mint",
        args: [account.address, parseEther(taskArgs.mintAmount)],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Tokens minted in transaction:", receipt.transactionHash);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\nError: ${error.message}`);
      } else {
        console.error("\nAn unexpected error occurred");
      }
      process.exit(1);
    }
  });

/*
npx hardhat mint-tokens [amount] --network sepolia
*/
