import { task } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";
import { parseEther } from "viem";

export default task("vote", "Vote for proposals")
  .addPositionalParam("proposalNum", "Proposal number to vote for")
  .addPositionalParam(
    "amount",
    "Amount of votes to cast in ETH units (e.g., 0.1 for 0.1 ETH worth of voting power)"
  )
  .setAction(async (taskArgs) => {
    try {
      const { walletClient, account } = setupClients();
      
      const contractAddress = contractConfig.TokenizedBallot_address;
      if (!contractAddress) {
        throw new Error("Ballot contract address not found in config");
      }

      const votesInWei = parseEther(taskArgs.amount);
      console.log(
        `Voting ${votesInWei.toLocaleString()} wei for proposal ${
          taskArgs.proposalNum
        }`
      );

      // Send the vote transaction
      const hash = await walletClient.writeContract({
        address: contractAddress as `0x${string}`,
        abi,
        functionName: "vote",
        args: [BigInt(taskArgs.proposalNum), votesInWei],
        account,
      });

      console.log(`Vote tx hash: ${hash}`);
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
npx hardhat vote [proposalNum] [amount] --network sepolia
Example: npx hardhat vote 1 0.1 --network sepolia (votes with 0.1 ETH worth of power)
*/
