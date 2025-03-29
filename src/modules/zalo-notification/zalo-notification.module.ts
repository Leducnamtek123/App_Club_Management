import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipFeeEntity } from '../membership-fee/membership-fee.entity';
import { ZaloNotificationController } from './zalo-notification.controller';
import { NotificationService } from './zalo-notification.service';
import { Module } from '@nestjs/common';
import { ZaloNotificationEntity } from './zalo-notification.entity';
import { UserEntity } from '../user/user.entity';
import { ZnsModule } from '../zns/zns.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ZaloNotificationEntity,
      MembershipFeeEntity,
      UserEntity,
    ]),
    ZnsModule,
  ],
  providers: [NotificationService],
  controllers: [ZaloNotificationController],
  exports: [NotificationService],
})
export class NotificationModule {}
