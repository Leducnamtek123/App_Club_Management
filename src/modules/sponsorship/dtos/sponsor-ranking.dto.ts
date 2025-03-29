import { ApiProperty } from '@nestjs/swagger';

export class SponsorRankingDto {
  @ApiProperty({ description: 'ID nhà tài trợ' })
  sponsorId!: string;

  @ApiProperty({ description: 'Tên nhà tài trợ' })
  sponsorName!: string;

  @ApiProperty({ description: 'Tổng số tiền tài trợ' })
  totalAmount!: string;

  @ApiProperty({ description: 'Số lượng sự kiện đã tài trợ' })
  eventCount!: number;
}
