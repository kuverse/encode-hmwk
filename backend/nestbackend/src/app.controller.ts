import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MintTokenDto } from './dtos/mintToken.dto';
import { SelfDelegateDto } from './dtos/selfDelegate.dto';
import { VoteDto } from './dtos/vote.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('token-name')
  async getTokenName() {
    return { result: await this.appService.getTokenName() };
  }

  @Get('contract-address')
  getContractAddress() {
    return { result: this.appService.getContractAddress() };
  }

  @Get('total-supply')
  async getTotalSupply() {
    return { result: await this.appService.getTotalSupply() };
  }

  @Get('token-balance/:address')
  async getTokenBalance(@Param('address') address: string) {
    return { result: await this.appService.getTokenBalance(address) };
  }

  @Get('transaction-receipt')
  async getTransactionReceipt(@Query('hash') hash: string) {
    return { result: await this.appService.getTransactionReceipt(hash) };
  }

  @Get('server-wallet-address')
  getServerWalletAddress() {
    return { result: this.appService.getServerWalletAddress() };
  }

  @Get('check-minter-role')
  async checkMinterRole(@Query('address') address: string) {
    return { result: await this.appService.checkMinterRole(address) };
  }

  @Get('get-voting-power')
  async getVotingPower(@Query('address') address: string) {
    return { result: await this.appService.getVotingPower(address) };
  }

  @Get('get-results')
  async getResults() {
    return { result: await this.appService.getResults() };
  }

  @Get('winning-proposal')
  async winningProposal() {
    return { result: await this.appService.winningProposal() };
  }

  @Get('winning-name')
  async winningName() {
    return { result: await this.appService.winningName() };
  }

  @Post('mint-tokens')
  async mintTokens(@Body() body: MintTokenDto) {
    return { result: await this.appService.mintTokens(body.address) };
  }

  @Post('self-delegate')
  async selfDelegate(@Body() body: SelfDelegateDto) {
    return { result: await this.appService.selfDelegate(body.address) };
  }

  @Post('vote')
  async vote(@Body() body: VoteDto) {
    return {
      result: await this.appService.vote(
        body.address,
        body.proposal,
        body.amount,
      ),
    };
  }
}
