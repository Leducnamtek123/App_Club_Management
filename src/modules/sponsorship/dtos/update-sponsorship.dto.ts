// src/modules/sponsorships/dtos/update-sponsorship.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  StringFieldOptional,
  NumberFieldOptional,
} from '../../../decorators/field.decorators';

export class UpdateSponsorshipDto {
  @ApiPropertyOptional({ description: 'ID của hội viên tài trợ' })
  @StringFieldOptional({ nullable: true })
  sponsorId?: Uuid;

  @ApiPropertyOptional({ description: 'ID của sự kiện được tài trợ' })
  @StringFieldOptional({ nullable: true })
  eventId?: Uuid;

  @ApiPropertyOptional({ description: 'Số tiền tài trợ' })
  @NumberFieldOptional({ nullable: true })
  amount?: number;

  @ApiPropertyOptional({ description: 'Ghi chú về tài trợ' })
  @StringFieldOptional({ nullable: true })
  note?: string;
}