import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { NotificationType } from '../../constants/enum/notification-type.enum';
import { UserEntity } from '../user/user.entity';
import { ZnsService } from '../zns/zns.service';
import { ZaloNotificationEntity } from './zalo-notification.entity';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageDto } from '../../common/dto/page.dto';
import { NotificationDto } from './dtos/zalo-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(ZaloNotificationEntity)
    private notificationRepo: Repository<ZaloNotificationEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private znsService: ZnsService,
    private configService: ConfigService,
  ) {}

  async broadcast(message: string) {
    const notification = this.notificationRepo.create({
      type: NotificationType.BROADCAST,
      message,
    });
    await this.notificationRepo.save(notification);

    const users = await this.userRepo.find();
    const templateId = this.configService.get<string>(
      ' ZNS_BROADCAST_TEMPLATE_ID',
    );
    if (!templateId) {
      throw new Error("Can't get ZNS_BROADCAST_TEMPLATE_ID");
    }
    for (const user of users) {
      await this.znsService.queueSend(user.zaloId!, templateId, { message });
    }
    return notification.toDto();
  }

  async remindFee(userIds: string[]) {
    const selectedUsers = await this.userRepo.find({
      where: { id: In(userIds) },
    });
    if (selectedUsers.length === 0)
      throw new Error('No users selected for fee reminder');

    const notification = this.notificationRepo.create({
      type: NotificationType.REMIND_FEE,
      message: 'Nhắc nhở: Vui lòng nộp phí hội viên!',
      recipients: selectedUsers,
    });
    await this.notificationRepo.save(notification);

    const templateId = this.configService.get<string>(
      'ZNS_REMIND_FEE_TEMPLATE_ID',
    );

    if (!templateId) {
      throw new Error("Can't get ZNS_REMIND_FEE_TEMPLATE_ID");
    }

    for (const user of selectedUsers) {
      await this.znsService.queueSend(user.zaloId!, templateId, {
        user_name: user.name,
        amount: '200,000 VND', // Có thể lấy từ payments nếu cần
      });
    }
    return notification.toDto();
  }

  async remindBirthday() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const birthdayUsers = await this.userRepo
      .createQueryBuilder('user')
      .where(
        'EXTRACT(MONTH FROM user.birthDate) = :month AND EXTRACT(DAY FROM user.birthDate) = :day',
        {
          month,
          day,
        },
      )
      .getMany();

    if (birthdayUsers.length === 0) return;

    const notification = this.notificationRepo.create({
      type: NotificationType.REMIND_BIRTHDAY,
      message: 'Chúc mừng sinh nhật!',
      recipients: birthdayUsers,
    });
    await this.notificationRepo.save(notification);

    const templateId = this.configService.get<string>(
      'ZNS_REMIND_BIRTHDAY_TEMPLATE_ID',
    );

    if (!templateId) {
      throw new Error("Can't get ZNS_REMIND_BIRTHDAY_TEMPLATE_ID");
    }
    for (const user of birthdayUsers) {
      await this.znsService.queueSend(user.zaloId!, templateId, {
        user_name: user.name,
      });
    }
    return notification.toDto();
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleBirthdayReminders() {
    await this.remindBirthday();
  }

  async getNotifications(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<NotificationDto>> {
    const queryBuilder = this.notificationRepo
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.recipients', 'recipients');

    queryBuilder.orderBy('notification.createdAt', 'DESC');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getNotification(id: Uuid) {
    const notification = await this.notificationRepo.findOneOrFail({
      where: { id },
      relations: ['recipients'],
    });
    return notification.toDto();
  }
}
