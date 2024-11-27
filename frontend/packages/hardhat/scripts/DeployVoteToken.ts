import { createPublicClient, http, createWalletClient } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";
dotenv.config();
import {
  abi,
  bytecode,
} from "../artifacts/contracts/MyERC20Vote.sol/MyToken.json";

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || !privateKey.startsWith("0x")) {
    throw new Error("Private key must be a hex string starting with 0x");
  }
  const account = privateKeyToAccount(privateKey as `0x${string}`);

  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: sepolia,
    transport: http(),
    account,
  });

  console.log("Deploying MyERC20Vote contract...");
  const hash = await walletClient.deployContract({
    abi,
    bytecode: bytecode as `0x${string}`,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Token contract deployed to:", receipt.contractAddress);
}

main().catch(console.error);

/*
npx hardhat run scripts/DeployVoteToken.ts --network sepolia

Save the contract address output and add it to your contract.config.json file as MyERC20Vote_address if you want a new one.
Otherwise use the existing one.
*/
