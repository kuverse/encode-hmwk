import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/TokenizedBallot.json';
import * as contractConfig from './assets/contract.config.json';

import {
  createPublicClient,
  http,
  Address,
  formatEther,
  createWalletClient,
  parseEther,
} from 'viem';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class AppService {
  publicClient;
  walletClient;
  account;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<Address>('ALCHEMY_API_KEY');
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`),
    });
    const account = privateKeyToAccount(
      `0x${this.configService.get<string>('PRIVATE_KEY')}`,
    );
    this.walletClient = createWalletClient({
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`),
      chain: sepolia,
      account: account,
    });
  }

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): Address {
    return this.configService.get<Address>('TOKEN_ADDRESS');
  }

  async getTokenName(): Promise<string> {
    const name = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }

  async getTotalSupply() {
    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });
    const totalSupply = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    return `${formatEther(totalSupply as bigint)} ${symbol}`;
  }

  async getTokenBalance(address: string) {
    const symbol = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });
    const balanceOf = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'balanceOf',
      args: [address],
    });
    return `${formatEther(balanceOf as bigint)} ${symbol}`;
  }

  async getTransactionReceipt(hash: string) {
    const tx = await this.publicClient.getTransactionReceipt({ hash });
    return `Transaction status: ${tx.status}, Block number: ${tx.blockNumber}`;
  }

  getServerWalletAddress() {
    return this.walletClient.account.address;
  }

  async checkMinterRole(address: string) {
    const MINTER_ROLE = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'MINTER_ROLE',
    });
    const hasRole = await this.publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'hasRole',
      args: [MINTER_ROLE, address],
    });
    return hasRole;
  }

  async mintTokens(address: string) {
    const contractAddress = this.getContractAddress();
    const mintAmount = '100';
    const hash = await this.walletClient.writeContract({
      address: contractAddress as Address,
      abi: tokenJson.abi,
      functionName: 'mint',
      args: [address, parseEther(mintAmount)],
    });
    const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
    return `Minted ${mintAmount} tokens at blockNumber: ${receipt.blockNumber}. Transaction Reciept: ${receipt.transactionHash}`;
  }

  async getVotingPower(address: string) {
    const contractAddress = this.getContractAddress();
    const votingPower = (await this.publicClient.readContract({
      address: contractAddress as Address,
      abi: tokenJson.abi,
      functionName: 'getVotes',
      args: [address],
    })) as bigint;

    return votingPower.toLocaleString();
  }

  async getResults() {
    const contractAddress = contractConfig.TokenizedBallot_address;
    const proposalCount = (await this.publicClient.readContract({
      address: contractAddress as Address,
      abi: ballotJson.abi,
      functionName: 'getProposalsCount',
    })) as number;

    const proposalsList = [];

    for (let i = 0; i < proposalCount; i++) {
      const proposal = (await this.publicClient.readContract({
        address: contractAddress as Address,
        abi: ballotJson.abi,
        functionName: 'proposals',
        args: [i],
      })) as [string, bigint];

      const proposalName = Buffer.from(
        contractConfig.proposals[Number(i)],
      ).toString();
      proposalsList.push({
        id: i,
        name: proposalName,
        votes: proposal[1].toLocaleString(),
      });
    }
    return proposalsList;
  }

  async selfDelegate(address: string) {
    const contractAddress = contractConfig.MyERC20Vote_address;
    const hash = await this.walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: tokenJson.abi,
      functionName: 'delegate',
      args: [address],
    });

    return hash;
  }

  async vote(address: string, proposal: number, amount: number) {
    const contractAddress = contractConfig.TokenizedBallot_address;
    const votesInWei = parseEther(amount.toString());

    const hash = await this.walletClient.writeContract({
      address: contractAddress as Address,
      abi: ballotJson.abi,
      functionName: 'vote',
      args: [BigInt(proposal), votesInWei],
      account: this.account,
    });
    return hash;
  }

  async winningProposal() {
    const contractAddress = contractConfig.TokenizedBallot_address;
    const winningProposal = await this.publicClient.readContract({
      address: contractAddress as Address,
      abi: ballotJson.abi,
      functionName: 'winningProposal',
    });
    const result = winningProposal.toString().split(',')[0];
    return result;
  }

  async winningName() {
    const contractAddress = contractConfig.TokenizedBallot_address;
    const winningName = await this.publicClient.readContract({
      address: contractAddress as Address,
      abi: ballotJson.abi,
      functionName: 'winnerName',
    });
    const name = Buffer.from((winningName as string).slice(2), 'hex')
      .toString()
      .replace(/\u0000/g, '');
    return name;
  }
}
