import { Injectable } from '@nestjs/common';
import * as tokenJson from './assets/MyToken.json';
import { createPublicClient, http, Address, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): Address {
    return this.configService.get<Address>('TOKEN_ADDRESS');
  }

  async getTokenName(): Promise<string> {
    const apiKey = this.configService.get<Address>('ALCHEMY_API_KEY');
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`),
    });
    const name = await publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'name',
    });
    return name as string;
  }

  async getTotalSupply() {
    const apiKey = this.configService.get<Address>('ALCHEMY_API_KEY');
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(`https://eth-sepolia.g.alchemy.com/v2/${apiKey}`),
    });
    const symbol = await publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'symbol',
    });
    const totalSupply = await publicClient.readContract({
      address: this.getContractAddress(),
      abi: tokenJson.abi,
      functionName: 'totalSupply',
    });
    return `${formatEther(totalSupply as bigint)} ${symbol}`;
  }
}
