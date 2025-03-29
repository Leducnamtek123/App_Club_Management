import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';

export class CreateTransactionCategoryDto {
  @ApiProperty({
    description: 'Tên loại giao dịch (duy nhất)',
    example: 'membership_fee',
  })
  @StringField({ nullable: false })
  name!: string;

  @ApiPropertyOptional({
    description: 'Mô tả loại giao dịch',
    example: 'Phí hội viên',
  })
  @StringFieldOptional({ nullable: true })
  description?: string;
}
