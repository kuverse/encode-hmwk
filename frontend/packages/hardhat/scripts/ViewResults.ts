import { task } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();
import { abi } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import contractConfig from "../config/contract.config.json";
import { setupClients } from "./utils/clientConfig";

export default task("view-results", "Display voting results").setAction(
  async () => {
    try {
      const { publicClient } = setupClients();

      const contractAddress = contractConfig.TokenizedBallot_address;
      if (!contractAddress) {
        throw new Error(
          "TokenizedBallot address not provided and not found in config"
        );
      }

      const proposalCount = (await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: "getProposalsCount",
      })) as number;

      console.log(`\nProposal Votes Summary @ ${contractAddress}`);
      console.log("--------------------------------------------");
      console.log("ID | Name | Votes");
      console.log("----------------------");

      for (let i = 0; i < proposalCount; i++) {
        const proposal = (await publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: abi,
          functionName: "proposals",
          args: [i],
        })) as [string, bigint];
        const proposalName = Buffer.from(
          contractConfig.proposals[Number(i)]
        ).toString();
        console.log(
          `${i} | ${proposalName} | ${proposal[1].toLocaleString()} wei`
        );
      }
      console.log("--------------------------------------------");

      const winningProposal = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: "winningProposal",
      });

      const winnerName = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: abi,
        functionName: "winnerName",
      });

      console.log(
        `\nWinning proposal is #${winningProposal} with name: ${Buffer.from(
          (winnerName as string).slice(2),
          "hex"
        ).toString()}\n`
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`\nError: ${error.message}`);
      } else {
        console.error("\nAn unexpected error occurred");
      }
      process.exit(1);
    }
  }
);

/*
npx hardhat view-results --network sepolia
*/
