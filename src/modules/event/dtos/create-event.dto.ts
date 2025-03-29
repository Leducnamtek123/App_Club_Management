import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  StringField,
  NumberField,
  DateFieldOptional,
} from '../../../decorators/field.decorators';
import { EventStatus } from '../../../constants/enum/event-status.enum';

export class CreateEventDto {
  @ApiProperty()
  @StringField({ nullable: false })
  title!: string;

  @ApiProperty()
  @StringField({ nullable: false })
  description!: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;

  @ApiPropertyOptional()
  @DateFieldOptional({ nullable: true }) // Sửa thành DateFieldOptional
  ticketClosingDate?: string;

  @ApiProperty()
  @StringField({ nullable: false })
  location!: string;

  @ApiProperty({ required: true })
  @StringField({ nullable: false }) // Bắt buộc branchId
  branchId!: string;

  @ApiPropertyOptional({ description: 'Trạng thái', enum: EventStatus })
  @IsEnum(EventStatus)
  status!: EventStatus;

  @ApiPropertyOptional()
  @NumberField({ nullable: true })
  ticketPrice?: number;
}
