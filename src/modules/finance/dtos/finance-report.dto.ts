import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject, IsString, Min } from 'class-validator';
import { TransactionType } from '../../../constants/enum/transaction-type.enum';

// DTO cho chi tiết theo loại giao dịch (INCOME/EXPENSE)
export class TransactionTypeDetailDto {
  @ApiProperty({ description: 'Số lượng giao dịch', example: 1 })
  @IsNumber()
  @Min(0)
  count!: number;

  @ApiProperty({ description: 'Tổng số tiền', example: 1000000 })
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class BranchDetailDto {
  @ApiProperty({ description: 'Tên chi hội', example: 'HCM' })
  @IsString()
  branchName!: string;

  @ApiProperty({ description: 'Chi tiết thu', type: TransactionTypeDetailDto })
  @Type(() => TransactionTypeDetailDto)
  @IsObject()
  income!: TransactionTypeDetailDto;

  @ApiProperty({ description: 'Chi tiết chi', type: TransactionTypeDetailDto })
  @Type(() => TransactionTypeDetailDto)
  @IsObject()
  expense!: TransactionTypeDetailDto;
}

// DTO chính cho báo cáo tài chính
export class FinanceReportDto {
  @ApiProperty({ description: 'Tổng thu', example: 1500000 })
  @IsNumber()
  @Min(0)
  totalIncome!: number;

  @ApiProperty({ description: 'Tổng chi', example: 10000 })
  @IsNumber()
  @Min(0)
  totalExpense!: number;

  @ApiProperty({ description: 'Số dư', example: 1490000 })
  @IsNumber()
  balance!: number;

  @ApiProperty({ description: 'Tổng số giao dịch', example: 2 })
  @IsNumber()
  @Min(0)
  totalTransactions!: number;

  @ApiProperty({ description: 'Tổng số phí hội viên', example: 1 })
  @IsNumber()
  @Min(0)
  totalMembershipPayments!: number;

  @ApiProperty({
    description: 'Chi tiết theo loại giao dịch',
    type: Object,
    example: {
      [TransactionType.INCOME]: { count: 2, amount: 1500000 },
      [TransactionType.EXPENSE]: { count: 1, amount: 10000 },
    },
  })
  @IsObject()
  byType!: Record<TransactionType, TransactionTypeDetailDto>;

  @ApiProperty({
    description: 'Chi tiết theo chi hội',
    type: Object,
    example: {
      '73815cff-c9fd-40b7-bbea-5a25dbebc8a4': {
        branchName: 'HCM',
        income: { count: 2, amount: 1500000 },
        expense: { count: 1, amount: 10000 },
      },
    },
  })
  @IsObject()
  byBranch!: Record<string, BranchDetailDto>;
}