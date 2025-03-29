// src/modules/sponsorships/dtos/create-sponsorship.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StringField,
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateSponsorshipDto {
  @ApiProperty({ description: 'ID của hội viên tài trợ' })
  @StringField({ nullable: false })
  sponsorId!: Uuid;

  @ApiProperty({ description: 'ID của sự kiện được tài trợ' })
  @StringField({ nullable: false })
  eventId!: Uuid;

  @ApiProperty({ description: 'Số tiền tài trợ' })
  @NumberField({ nullable: false })
  amount!: number;

  @ApiPropertyOptional({ description: 'Ghi chú về tài trợ' })
  @StringFieldOptional({ nullable: true })
  note?: string;
}
