import { viem } from "hardhat";
import { parseEther, formatEther, toHex } from "viem";
import proposalsJson from "../config/proposalsTest.json";

const MINT_VALUE = parseEther("10");
const TARGET_BLOCK_NUMBER = 5n;

async function displayProposalsSummary(
  contractTokenizedBallot: any,
  proposals: string[],
  proposalsJson: { proposals: string[] }
) {
  console.log("\nProposal Votes Summary:");
  console.log("--------------------------------------------");
  console.log("ID | Name | Votes");
  console.log("----------------------");
  for (let i = 0n; i < BigInt(proposals.length); i++) {
    const proposal = await contractTokenizedBallot.read.proposals([i]);
    const name = Buffer.from(proposalsJson.proposals[Number(i)]).toString();
    console.log(`${i} | ${name} | ${proposal[1].toLocaleString()} wei`);
  }
  console.log("--------------------------------------------");

  const [winningProposalId, _] =
    await contractTokenizedBallot.read.winningProposal();
  const winningProposalName = await contractTokenizedBallot.read.winnerName();
  console.log(
    `\nWinning proposal is #${winningProposalId} with name: ${Buffer.from(
      winningProposalName.slice(2),
      "hex"
    ).toString()}\n`
  );
}

async function main() {
  const publicClient = await viem.getPublicClient();
  const [_, acc1, acc2] = await viem.getWalletClients();
  const contractToken = await viem.deployContract("MyToken");
  console.log(`Token contract deployed at ${contractToken.address}\n`);

  const mintTx = await contractToken.write.mint([
    acc1.account.address,
    MINT_VALUE,
  ]);
  await publicClient.waitForTransactionReceipt({ hash: mintTx });
  console.log(
    `Minted ${formatEther(MINT_VALUE)} ETH to account ${acc1.account.address}\n`
  );
  const balanceBN = await contractToken.read.balanceOf([acc1.account.address]);
  console.log(
    `Account ${acc1.account.address} has ${formatEther(
      balanceBN
    )} ETH of MyToken\n`
  );

  const votes = await contractToken.read.getVotes([acc1.account.address]);
  console.log(
    `Account ${
      acc1.account.address
    } has ${votes.toLocaleString()} units of voting power before self delegating\n`
  );

  const delegateTx = await contractToken.write.delegate(
    [acc1.account.address],
    {
      account: acc1.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: delegateTx });
  const votesAfter = await contractToken.read.getVotes([acc1.account.address]);
  console.log(
    `Account ${acc1.account.address} has ${Number(
      votesAfter
    ).toLocaleString()} units of voting power after self delegating\n`
  );

  // token transfer
  const transferTx = await contractToken.write.transfer(
    [acc2.account.address, MINT_VALUE / 4n],
    {
      account: acc1.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: transferTx });
  const votes1AfterTransfer = await contractToken.read.getVotes([
    acc1.account.address,
  ]);
  console.log(
    `Account ${
      acc1.account.address
    } has ${votes1AfterTransfer.toLocaleString()} units of voting power after transferring\n`
  );

  const votes2AfterTransfer = await contractToken.read.getVotes([
    acc2.account.address,
  ]);
  console.log(
    `Account ${
      acc2.account.address
    } has ${votes2AfterTransfer.toLocaleString()} units of voting power after receiving a transfer\n`
  );

  const delegateTx2 = await contractToken.write.delegate(
    [acc2.account.address],
    {
      account: acc2.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: delegateTx2 });
  const votesAfter2 = await contractToken.read.getVotes([acc2.account.address]);
  console.log(
    `Account ${acc2.account.address} has ${Number(
      votesAfter2
    ).toLocaleString()} units of voting power after self delegating after receiving tokens\n`
  );

  // get past votes
  const lastBlockNumber = await publicClient.getBlockNumber();
  for (let index = lastBlockNumber - 1n; index > 0n; index--) {
    const pastVotes = await contractToken.read.getPastVotes([
      acc1.account.address,
      index,
    ]);
    console.log(
      `Account ${
        acc1.account.address
      } had ${pastVotes.toLocaleString()} units of voting power at block ${index}`
    );
  }
  console.log("\n");

  // deploy TokenizedBallot
  console.log("*** Deploying TokenizedBallot contract ***");
  const proposals = proposalsJson.proposals.map((prop: string) =>
    toHex(prop, { size: 32 })
  );
  const contractTokenizedBallot = await viem.deployContract("TokenizedBallot", [
    proposals,
    contractToken.address,
    TARGET_BLOCK_NUMBER,
  ]);
  console.log(
    `TokenizedBallot contract deployed at ${
      contractTokenizedBallot.address
    } | blockheight: ${(await publicClient.getBlockNumber()) - 1n}\n`
  );

  // Check voting power before any votes
  console.log("*** Checking voting power before any votes ***");
  let votingPowerAcc1 = await contractTokenizedBallot.read.getVotingPower([
    acc1.account.address,
  ]);
  let votingPowerAcc2 = await contractTokenizedBallot.read.getVotingPower([
    acc2.account.address,
  ]);
  console.log(
    `Voting power of ${
      acc1.account.address
    }: ${votingPowerAcc1.toLocaleString()}\n`,
    `Voting power of ${
      acc2.account.address
    }: ${votingPowerAcc2.toLocaleString()}\n`
  );

  // Before any voting takes place
  console.log("*** Proposals before any voting ***");
  await displayProposalsSummary(
    contractTokenizedBallot,
    proposals,
    proposalsJson
  );

  // Voting first round
  console.log("*** Voting first round ***");
  const vote1_1 = await contractTokenizedBallot.write.vote(
    [1n, parseEther("1")],
    {
      account: acc1.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: vote1_1 });
  console.log(
    `Account ${acc1.account.address} voted for proposal 1 with 1 ether votes`
  );

  const vote1_2 = await contractTokenizedBallot.write.vote(
    [3n, parseEther("2")],
    {
      account: acc1.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: vote1_2 });
  console.log(
    `Account ${acc1.account.address} voted for proposal 3 with 2 ether votes\n`
  );

  const vote2_1 = await contractTokenizedBallot.write.vote(
    [3n, parseEther("1.5")],
    {
      account: acc2.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: vote2_1 });
  console.log(
    `Account ${acc2.account.address} voted for proposal 3 with 1.5 ether votes\n`
  );

  // Check status after first round
  console.log("*** Voting status after round 1***");
  votingPowerAcc1 = await contractTokenizedBallot.read.getVotingPower([
    acc1.account.address,
  ]);
  votingPowerAcc2 = await contractTokenizedBallot.read.getVotingPower([
    acc2.account.address,
  ]);
  console.log(
    `Voting power of ${
      acc1.account.address
    }: ${votingPowerAcc1.toLocaleString()}\n`,
    `Voting power of ${
      acc2.account.address
    }: ${votingPowerAcc2.toLocaleString()}`
  );

  // Display table of all proposals and votes
  await displayProposalsSummary(
    contractTokenizedBallot,
    proposals,
    proposalsJson
  );

  // Voting second round with some schenanigans
  console.log("*** Voting second round ***");
  votingPowerAcc1 = await contractTokenizedBallot.read.getVotingPower([
    acc1.account.address,
  ]);
  console.log(
    `Attempting to vote 6 ether for proposal 2 with account ${
      acc1.account.address
    }..., voting power left is ${formatEther(votingPowerAcc1)} ETH.`
  );
  try {
    const vote3 = await contractTokenizedBallot.write.vote(
      [2n, parseEther("6")],
      {
        account: acc1.account,
      }
    );
    await publicClient.waitForTransactionReceipt({ hash: vote3 });
    console.log("Vote succeeded - this should not happen!\n");
  } catch (error) {
    console.log(
      "Vote failed as expected: trying to vote with more votes than available\n"
    );
  }

  // Voting round 2
  const vote1_3 = await contractTokenizedBallot.write.vote(
    [2n, parseEther("4")],
    {
      account: acc1.account,
    }
  );
  await publicClient.waitForTransactionReceipt({ hash: vote1_3 });
  console.log(
    `Account ${acc1.account.address} voted for proposal 2 with 4 ether votes\n`
  );

  await displayProposalsSummary(
    contractTokenizedBallot,
    proposals,
    proposalsJson
  );

  console.log("...end of main...");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

// run with: npx hardhat run ./scripts/TestVotesLocalNetwork.ts
