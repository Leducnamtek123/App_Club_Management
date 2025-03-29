import { ApiPropertyOptional } from '@nestjs/swagger';
import {  IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class TicketsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'ID của hội viên', type: String })
  @IsOptional()
  userId?: Uuid;

  @ApiPropertyOptional({ description: 'ID của sự kiện', type: String })
  @IsOptional()
  eventId?: Uuid;
}