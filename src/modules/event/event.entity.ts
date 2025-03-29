// src/modules/events/event.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { BranchEntity } from '../branch/branch.entity';
import { EventDto } from './dtos/event.dto';
import { AbstractEntity } from '../../common/abstract.entity';
import { UserEntity } from '../user/user.entity';
import { EventStatus } from '../../constants/enum/event-status.enum';

@Entity({ name: 'events' })
@UseDto(EventDto)
export class EventEntity extends AbstractEntity<EventDto> {
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'timestamp', nullable: true })
  startDate?: Date;
  
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  ticketClosingDate?: Date;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: BranchEntity;

  @Column({ type: 'uuid', nullable: true })
  branch_id?: string;

  @Column({
    type: 'enum',
    enum: EventStatus,
  })
  status!: EventStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) // (0 = Free)
  ticketPrice!: number;

  @Column({ type: 'json', nullable: true })
  images?: string[];

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  created_by_id?: string;
}