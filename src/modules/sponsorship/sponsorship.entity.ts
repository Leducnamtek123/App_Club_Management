import { Entity, ManyToOne, Column, JoinColumn } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { EventEntity } from '../event/event.entity';
import { FinanceEntity } from '../finance/finance-report.abstract.entity';
import { UserEntity } from '../user/user.entity';
import { SponsorshipDto } from './dtos/sponsorship.dto';
import { SponsorshipTierEntity } from '../sponsorship-tier/sponsorship-tier.entity';

@Entity({ name: 'sponsorships' })
@UseDto(SponsorshipDto)
export class SponsorshipEntity extends FinanceEntity<SponsorshipDto> {
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sponsor_id' })
  sponsor!: UserEntity;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @ManyToOne(() => SponsorshipTierEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'tier_id' })
  tier?: SponsorshipTierEntity | null;
  
  @Column({ type: 'varchar', nullable: true })
  logo?: string; 
}
