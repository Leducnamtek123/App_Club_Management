// src/modules/sponsorship-tiers/dtos/sponsorship-tier.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { SponsorshipTierEntity } from '../sponsorship-tier.entity';
import { EventDto } from '../../event/dtos/event.dto';
import { SponsorshipTier } from '../../../constants/enum/sponsorship-tier.enum';

export class SponsorshipTierDto extends AbstractDto {
  @ApiProperty({ enum: SponsorshipTier, description: 'Tên mức tài trợ' })
  name: SponsorshipTier;

  @ApiProperty()
  minAmount: number;

  @ApiProperty({ type: () => EventDto })
  event: EventDto | undefined;

  constructor(entity: SponsorshipTierEntity) {
    super(entity);
    this.name = entity.name;
    this.minAmount = entity.minAmount;
    this.event = entity.event ? entity.event.toDto() : undefined;
  }
}
