import { task } from "hardhat/config";
import { parseEther } from "viem";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/MyERC20Vote.sol/MyToken.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";

export default task("transfer-tokens", "Transfer tokens to vote")
  .addPositionalParam("address", "Address to transfer tokens to")
  .addPositionalParam("amount", "Amount of tokens to transfer in ETH")
  .setAction(async (taskArgs) => {
    try {
      const { publicClient, walletClient } = setupClients();

      const contractAddress = contractConfig.MyERC20Vote_address;
      if (!contractAddress) {
        throw new Error("Token contract address not found in config");
      }

      // Transfer tokens to the address
      console.log(`Transferring ${taskArgs.amount} ETH to ${taskArgs.address}`);
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "transfer",
        args: [taskArgs.address, parseEther(taskArgs.amount)],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(
        `Tokens transfered in transaction to ${taskArgs.address}, tx hash: ${receipt.transactionHash}`
      );
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
npx hardhat transfer-tokens [address] [amount] --network sepolia
*/
