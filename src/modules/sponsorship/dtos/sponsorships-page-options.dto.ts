import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import {
  StringFieldOptional,
  NumberFieldOptional,
} from '../../../decorators/field.decorators';

export class SponsorshipsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID hội viên tài trợ' })
  @StringFieldOptional({ nullable: true })
  sponsorId?: Uuid;

  @ApiPropertyOptional({ description: 'Lọc theo ID sự kiện' })
  @StringFieldOptional({ nullable: true })
  eventId?: Uuid;

  @ApiPropertyOptional({ description: 'Lọc theo số tiền tài trợ tối thiểu' })
  @NumberFieldOptional({ nullable: true })
  minAmount?: number;

  @ApiPropertyOptional({ description: 'Lọc theo số tiền tài trợ tối đa' })
  @NumberFieldOptional({ nullable: true })
  maxAmount?: number;
}
