import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from '../../../constants/enum/transaction-type.enum';
import {
  StringFieldOptional,
  StringField,
  NumberField,
} from '../../../decorators/field.decorators';
export class CreateTransactionDto {
  @ApiPropertyOptional({
    description: 'ID của loại giao dịch (nếu có)',
  })
  @StringFieldOptional({ nullable: true })
  categoryId?: string;

  @ApiProperty({
    description: 'Loại giao dịch (income/expense)',
    enum: TransactionType,
  })
  @StringField({ nullable: false })
  type!: TransactionType;

  @ApiProperty({ description: 'Số tiền giao dịch' })
  @NumberField({ nullable: false })
  amount!: number;

  @ApiPropertyOptional({
    description: 'Mô tả giao dịch',
  })
  @StringFieldOptional({ nullable: true })
  description?: string;

  @ApiProperty({ description: 'ID chi hội' })
  @StringField()
  branchId?: Uuid;
}
