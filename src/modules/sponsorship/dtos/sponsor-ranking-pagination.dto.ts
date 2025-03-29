import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { StringFieldOptional } from '../../../decorators/field.decorators';

export class SponsorRankingPaginationDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Lọc theo ID chi nhánh' })
  @StringFieldOptional({ nullable: true })
  branchId?: Uuid;

  @ApiPropertyOptional({ description: 'Lọc theo ID sự kiện' })
  @StringFieldOptional({ nullable: true })
  eventId?: Uuid;
}
