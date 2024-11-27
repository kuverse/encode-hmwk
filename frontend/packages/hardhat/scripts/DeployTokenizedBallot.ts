import { task } from "hardhat/config";
import { toHex } from "viem";
import * as dotenv from "dotenv";
dotenv.config();
import {
  abi,
  bytecode,
} from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
import { setupClients } from "./utils/clientConfig";

export default task("deploy-tokenized-ballot", "Deploy Tokenized Ballot")
  .addPositionalParam("proposals", "Proposals to vote on")
  .addPositionalParam("erc20Address", "Address of the ERC20Votes Token")
  .addPositionalParam("targetBlock", "Target block height")
  .setAction(async (taskArgs) => {
    try {
      const { publicClient, walletClient } = setupClients();

      const proposals = taskArgs.proposals
        .split(",")
        .map((prop: string) => toHex(prop, { size: 32 }));

      console.log("Deploying Tokenized Ballot contract...");
      const hash = await walletClient.deployContract({
        abi,
        bytecode: bytecode as `0x${string}`,
        args: [proposals, taskArgs.erc20Address, taskArgs.targetBlock],
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Contract deployed to:", receipt.contractAddress);
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
npx hardhat run scripts/deploy-tokenized-ballot.ts [proposals] [erc20Address] [targetBlock] --network sepolia
e.g. npx hardhat deploy-tokenized-ballot "Vanilla,Chococlate,Salted Caramel,Strawberry,Mint" "0xcc73011fd7e2073a4aabdb95f9f19a2df4bd6cd6" "7043652" --network sepolia

Put the address in the contract.config.json file in TokenizedBallot_address
*/
