import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { TicketStatus } from '../../../constants/enum/ticket-status.enum';
import { EnumField, StringField } from '../../../decorators/field.decorators';
import { UserSimpleDto } from '../../user/dtos/user-simple.dto';
import { TicketEntity } from '../ticket.entity';
import { EventDto } from '../../event/dtos/event.dto';

export class TicketDto extends AbstractDto {
  @ApiProperty({ enum: TicketStatus })
  @EnumField(() => TicketStatus)
  status!: TicketStatus;

  @ApiProperty({
    description: 'Đường dẫn hoặc dữ liệu QR code',
    required: false,
  })
  @StringField({ nullable: true })
  qrCode?: string;

  @ApiProperty({ type: () => UserSimpleDto })
  user!: UserSimpleDto;

  @ApiProperty({ description: 'ID của sự kiện' })
  @StringField()
  event!: EventDto;

  constructor(entity: TicketEntity) {
    super(entity);
    this.status = entity.status;
    this.qrCode = entity.qrCode;
    this.user = new UserSimpleDto(entity.user);
    this.event = new EventDto(entity.event);
  }
}
