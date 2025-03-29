import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { NotificationType } from '../../../constants/enum/notification-type.enum';
import { EnumField, StringField } from '../../../decorators/field.decorators';
import { UserSimpleDto } from '../../user/dtos/user-simple.dto';
import { ZaloNotificationEntity } from '../zalo-notification.entity';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

export class NotificationDto extends AbstractDto {
  @ApiProperty({ enum: NotificationType })
  @EnumField(() => NotificationType)
  type!: NotificationType;

  @ApiProperty({ description: 'Nội dung thông báo' })
  @StringField()
  message!: string;

  @ApiPropertyOptional({
    description: 'Danh sách người nhận (nếu có)',
    type: [UserSimpleDto],
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UserSimpleDto)
  recipients?: UserSimpleDto[];

  constructor(entity: ZaloNotificationEntity) {
    super(entity);
    this.id = entity.id;
    this.type = entity.type;
    this.message = entity.message;
    this.recipients =
      entity.recipients?.map((user) => new UserSimpleDto(user)) || undefined;
    this.createdAt = entity.createdAt;
    this.updatedAt = entity.updatedAt;
  }
}
