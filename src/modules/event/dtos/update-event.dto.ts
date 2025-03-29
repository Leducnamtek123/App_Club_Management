import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EventStatus } from '../../../constants/enum/event-status.enum';
import {
  StringFieldOptional,
  DateFieldOptional,
  NumberFieldOptional,
  DateField,
} from '../../../decorators/field.decorators';

export class UpdateEventDto {
  @ApiPropertyOptional()
  @StringFieldOptional({ nullable: true })
  title?: string;

  @ApiPropertyOptional()
  @StringFieldOptional({ nullable: true })
  description?: string;

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;

  @ApiPropertyOptional()
  @DateFieldOptional({ nullable: true })
  ticketClosingDate?: string;

  @ApiPropertyOptional()
  @StringFieldOptional({ nullable: true })
  location?: string;

  @ApiPropertyOptional()
  @StringFieldOptional({ nullable: true })
  branchId!: Uuid;

  @ApiPropertyOptional({ description: 'Trạng thái', enum: EventStatus })
  @IsEnum(EventStatus)
  @IsOptional()
  status!: EventStatus;

  @ApiPropertyOptional()
  @NumberFieldOptional({ nullable: true })
  ticketPrice?: number;
}
