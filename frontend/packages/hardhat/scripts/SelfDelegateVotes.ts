import { task } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/MyERC20Vote.sol/MyToken.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";

export default task("self-delegate", "Self delegate votes")
  .addPositionalParam("address", "Address to delegate votes to")
  .setAction(async (taskArgs) => {
    try {
      const { walletClient } = setupClients();

      const contractAddress = contractConfig.MyERC20Vote_address;
      if (!contractAddress) {
        throw new Error("Token contract address not found in config");
      }

      // Send the delegation transaction to the specified address
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "delegate",
        args: [taskArgs.address],
      });

      console.log(`Delegation tx hash: ${hash}`);
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
npx hardhat self-delegate [address] --network sepolia
*/
