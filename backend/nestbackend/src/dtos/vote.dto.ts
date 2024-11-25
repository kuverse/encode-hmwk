import { ApiProperty } from '@nestjs/swagger';

export class VoteDto {
  @ApiProperty({ type: String, required: true, default: 'My Address' })
  address: string;
  @ApiProperty({ type: Number, required: true, default: '0-4' })
  proposal: number;
  @ApiProperty({ type: Number, required: true, default: 'How many votes' })
  amount: number;
}
