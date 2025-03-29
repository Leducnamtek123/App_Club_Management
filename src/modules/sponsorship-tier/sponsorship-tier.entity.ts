// src/modules/sponsorship-tiers/sponsorship-tier.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { EventEntity } from '../event/event.entity';
import { AbstractEntity } from '../../common/abstract.entity';
import { SponsorshipTierDto } from './dtos/sponsorship-tier.dto';
import { SponsorshipTier } from '../../constants/enum/sponsorship-tier.enum';

@Entity({ name: 'sponsorship_tiers' })
@UseDto(SponsorshipTierDto)
export class SponsorshipTierEntity extends AbstractEntity<SponsorshipTierDto> {
  @Column({ type: 'enum', enum: SponsorshipTier, nullable: false })
  name!: SponsorshipTier;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  minAmount!: number;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;
}
