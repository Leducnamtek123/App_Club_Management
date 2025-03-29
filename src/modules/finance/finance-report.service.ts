// src/modules/finance-report/finance-report.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionType } from 'constants/enum/transaction-type.enum';
import { FinanceReportFilterDto } from 'modules/finance/dtos/finance-report-filter.dto';
import { FinanceReportDto } from 'modules/finance/dtos/finance-report.dto';
import { MembershipPaymentEntity } from 'modules/membership-payment/membership-payment.entity';
import { TransactionEntity } from 'modules/transaction/transaction.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class FinanceReportService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(MembershipPaymentEntity)
    private readonly membershipPaymentRepo: Repository<MembershipPaymentEntity>,
  ) {}

  async generateFinanceReport(
    filters: FinanceReportFilterDto,
  ): Promise<FinanceReportDto> {
    // Query cho Transactions
    const transactionQuery = this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.branch', 'branch');

    // Query cho Membership Payments
    const membershipQuery = this.membershipPaymentRepo
      .createQueryBuilder('membership')
      .leftJoinAndSelect('membership.branch', 'branch');

    // Áp dụng các bộ lọc
    this.applyFilters(transactionQuery, filters, 'transaction');
    this.applyFilters(membershipQuery, filters, 'membership');

    // Lấy dữ liệu
    const transactions = await transactionQuery.getMany();
    const membershipPayments = await membershipQuery.getMany();

    // Tính toán báo cáo
    const report = this.calculateReport(transactions, membershipPayments);
    return report;
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<
      TransactionEntity | MembershipPaymentEntity
    >,
    filters: FinanceReportFilterDto,
    alias: string,
  ) {
    if (filters.startDate || filters.endDate) {
      queryBuilder.andWhere(
        `${alias}.createdAt BETWEEN :startDate AND :endDate`,
        {
          startDate: filters.startDate || new Date(0),
          endDate: filters.endDate || new Date(),
        },
      );
    }

    if (filters.branch_id) {
      queryBuilder.andWhere(`${alias}.branch_id = :branch_id`, {
        branch_id: filters.branch_id,
      });
    }

    if (filters.type) {
      queryBuilder.andWhere(`${alias}.type = :type`, { type: filters.type });
    }
  }

  private calculateReport(
    transactions: TransactionEntity[],
    membershipPayments: MembershipPaymentEntity[],
  ): FinanceReportDto {
    const report: FinanceReportDto = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      totalTransactions: transactions.length,
      totalMembershipPayments: membershipPayments.length,
      byType: {
        [TransactionType.INCOME]: { count: 0, amount: 0 },
        [TransactionType.EXPENSE]: { count: 0, amount: 0 },
      },
      byBranch: {},
    };

    // Tính toán từ Transactions
    transactions.forEach((tx) => {
      const amount = Number(tx.amount);
      const branchId = tx.branch_id || 'unknown';
      const branchName = tx.branch?.name || 'Không xác định';

      // Khởi tạo branch nếu chưa có
      if (!report.byBranch[branchId]) {
        report.byBranch[branchId] = {
          branchName,
          income: { count: 0, amount: 0 },
          expense: { count: 0, amount: 0 },
        };
      }

      // Phân loại theo type
      if (tx.type === TransactionType.INCOME) {
        report.totalIncome += amount;
        report.byType[TransactionType.INCOME].count += 1;
        report.byType[TransactionType.INCOME].amount += amount;
        report.byBranch[branchId].income.count += 1;
        report.byBranch[branchId].income.amount += amount;
      } else if (tx.type === TransactionType.EXPENSE) {
        report.totalExpense += amount;
        report.byType[TransactionType.EXPENSE].count += 1;
        report.byType[TransactionType.EXPENSE].amount += amount;
        report.byBranch[branchId].expense.count += 1;
        report.byBranch[branchId].expense.amount += amount;
      }
    });

    // Tính toán từ Membership Payments (luôn là INCOME)
    membershipPayments.forEach((mp) => {
      const amount = Number(mp.amount);
      const branchId = mp.branch_id || 'unknown';
      const branchName = mp.branch?.name || 'Không xác định';

      if (!report.byBranch[branchId]) {
        report.byBranch[branchId] = {
          branchName,
          income: { count: 0, amount: 0 },
          expense: { count: 0, amount: 0 },
        };
      }

      report.totalIncome += amount;
      report.byType[TransactionType.INCOME].count += 1;
      report.byType[TransactionType.INCOME].amount += amount;
      report.byBranch[branchId].income.count += 1;
      report.byBranch[branchId].income.amount += amount;
    });

    // Tính số dư
    report.balance = report.totalIncome - report.totalExpense;

    return report;
  }
}
