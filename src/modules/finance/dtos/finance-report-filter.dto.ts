// src/modules/finance-report/dto/finance-report-filter.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionType } from 'constants/enum/transaction-type.enum';
import { StringFieldOptional } from 'decorators/field.decorators';

export class FinanceReportFilterDto {
  @ApiPropertyOptional({ description: 'Ngày bắt đầu', example: '2025-01-01' })
  @StringFieldOptional({ nullable: true })
  startDate?: string;

  @ApiPropertyOptional({ description: 'Ngày kết thúc', example: '2025-12-31' })
  @StringFieldOptional({ nullable: true })
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID chi hội' })
  @StringFieldOptional({ nullable: true })
  branch_id?: Uuid;

  @ApiPropertyOptional({ description: 'Loại giao dịch', enum: TransactionType })
  @StringFieldOptional({ nullable: true })
  type?: TransactionType;
}
