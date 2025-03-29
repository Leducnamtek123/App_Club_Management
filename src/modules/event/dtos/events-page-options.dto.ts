import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import {
  StringFieldOptional,
  DateFieldOptional,
  BooleanFieldOptional,
} from '../../../decorators/field.decorators';
import { EventStatus } from '../../../constants/enum/event-status.enum';

export class EventsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Lọc theo tiêu đề sự kiện' })
  @StringFieldOptional({ nullable: true })
  title?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái sự kiện',
    enum: EventStatus,
  })
  @StringFieldOptional({ nullable: true })
  status?: EventStatus;

  @ApiPropertyOptional({ description: 'Lọc theo ID chi nhánh (branch)' })
  @StringFieldOptional({ nullable: true })
  branchId?: Uuid;

  @ApiPropertyOptional({
    description: 'Lọc theo sự kiện miễn phí (true) hoặc có phí (false)',
  })
  @BooleanFieldOptional({ nullable: true })
  isFree?: boolean;

  @ApiPropertyOptional({ description: 'Ngày bắt đầu' })
  @DateFieldOptional({ nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'Ngày kết thúc' })
  @DateFieldOptional({ nullable: true })
  endDate?: Date;
}
