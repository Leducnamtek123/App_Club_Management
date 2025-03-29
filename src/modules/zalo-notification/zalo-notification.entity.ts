import { Entity, Column, JoinTable, ManyToMany } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators/use-dto.decorator';
import { NotificationDto as ZaloNotificationDto } from './dtos/zalo-notification.dto';
import { UserEntity } from '../user/user.entity';
import { NotificationType as ZaloNotificationType } from '../../constants/enum/notification-type.enum';

@Entity({ name: 'zalo-notifications' })
@UseDto(ZaloNotificationDto)
export class ZaloNotificationEntity extends AbstractEntity<ZaloNotificationDto> {
  @Column({
    type: 'enum',
    enum: ZaloNotificationType,
  })
  type!: ZaloNotificationType;

  @Column({ type: 'text' })
  message!: string;

  @ManyToMany(() => UserEntity, { nullable: true })
  @JoinTable({
    name: 'notification_recipients',
    joinColumn: { name: 'zalo_notification_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  recipients?: UserEntity[];
}
