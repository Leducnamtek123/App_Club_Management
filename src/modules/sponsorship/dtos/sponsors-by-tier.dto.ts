import { ApiProperty } from '@nestjs/swagger';
import { SponsorshipDto } from './sponsorship.dto';
import { SponsorshipTier } from '../../../constants/enum/sponsorship-tier.enum';

export class SponsorsByTierDto {
  @ApiProperty({ enum: SponsorshipTier, description: 'Tên hạng tài trợ' })
  tier?: SponsorshipTier | null;

  @ApiProperty({
    type: [SponsorshipDto],
    description: 'Danh sách nhà tài trợ trong hạng',
  })
  sponsors!: SponsorshipDto[];
}
