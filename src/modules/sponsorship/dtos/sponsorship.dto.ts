// src/modules/sponsorships/dtos/sponsorship.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { SponsorshipEntity } from '../sponsorship.entity';
import { UserDto } from '../../user/dtos/user.dto';
import { SponsorshipTierDto } from '../../sponsorship-tier/dtos/sponsorship-tier.dto';
import { EventDto } from '../../event/dtos/event.dto';
import { StringField } from 'decorators/field.decorators';

export class SponsorshipDto extends AbstractDto {
  @ApiProperty()
  amount: number;

  @ApiPropertyOptional()
  note?: string;

  @ApiProperty({ type: () => UserDto })
  sponsor: UserDto;

  @ApiProperty({ type: () => EventDto })
  event: EventDto;

  @ApiPropertyOptional({ type: () => SponsorshipTierDto })
  tier?: SponsorshipTierDto;

  @ApiProperty({ description: 'Đường dẫn hoặc dữ liệu logo', required: false })
  @StringField({ nullable: true })
  logo?: string;

  constructor(entity: SponsorshipEntity) {
    super(entity);
    this.amount = entity.amount;
    this.note = entity.note;
    this.sponsor = entity.sponsor.toDto();
    this.event = entity.event.toDto();
    this.tier = entity.tier ? entity.tier.toDto() : undefined;
    this.logo = entity.logo;
  }
}
