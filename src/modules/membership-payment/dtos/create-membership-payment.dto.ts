import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StringField,
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateMembershipPaymentDto {
  @ApiProperty({
    description: 'ID của hội viên',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @StringField({ nullable: false })
  user_id!: Uuid;

  @ApiProperty({ description: 'Năm áp dụng', example: 2023 })
  @NumberField({ nullable: false, minimum: 2000, maximum: 2200 })
  year!: number;

  @ApiPropertyOptional({
    description: 'Mô tả',
    example: 'Phí hội viên năm 2023',
  })
  @StringFieldOptional({ nullable: true })
  description?: string;
}
