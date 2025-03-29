import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { TicketStatus } from '../../constants/enum/ticket-status.enum';
import { UseDto } from '../../decorators/use-dto.decorator';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user/user.entity';
import { TicketDto } from './dtos/ticket.dto';

@Entity({ name: 'tickets' })
@UseDto(TicketDto)
export class TicketEntity extends AbstractEntity<TicketDto> {
  @Column({
    type: 'enum',
    enum: TicketStatus,
    default: TicketStatus.PENDING,
  })
  status!: TicketStatus;

  @Column({ type: 'varchar', nullable: true })
  qrCode?: string;

  @ManyToOne(() => UserEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @ManyToOne(() => EventEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event!: EventEntity;
}
