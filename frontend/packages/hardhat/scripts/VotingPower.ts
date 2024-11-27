import { task } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();
import {
  abi,
} from "../artifacts/contracts/MyERC20Vote.sol/MyToken.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";

export default task("voting-power", "Looking up voting power for an address")
  .addPositionalParam("address", "Target address")
  .setAction(async (taskArgs) => {
    try {
      const { publicClient } = setupClients();

      const contractAddress = contractConfig.MyERC20Vote_address;
      if (!contractAddress) {
        throw new Error("Token contract address not found in config");
      }

      // Lookup voting power
      const votingPower = (await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "getVotes",
        args: [taskArgs.address],
      })) as bigint;

      console.log(
        `Voting power for address ${
          taskArgs.address
        }: ${votingPower.toLocaleString()} votes (wei)`
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
npx hardhat voting-power [address] --network sepolia
*/
