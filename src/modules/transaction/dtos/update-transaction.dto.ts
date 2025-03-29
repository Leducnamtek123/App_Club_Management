import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TransactionType } from '../../../constants/enum/transaction-type.enum';

export class UpdateTransactionDto {
  @ApiPropertyOptional({
    description: 'Loại giao dịch',
    enum: TransactionType,
    example: TransactionType.INCOME,
  })
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Số tiền', example: 1000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({ description: 'Mô tả', example: 'Thanh toán hóa đơn' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ID chi hội' })
  @IsOptional()
  @IsString()
  branch_id?: string;
}
