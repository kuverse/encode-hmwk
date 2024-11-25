import { ApiProperty } from '@nestjs/swagger';

export class SelfDelegateDto {
  @ApiProperty({ type: String, required: true, default: 'My Address' })
  address: string;
}
