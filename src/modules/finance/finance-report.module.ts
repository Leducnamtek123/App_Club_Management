// src/modules/finance-report/finance-report.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceReportController } from 'modules/finance/finance-report.controller';
import { FinanceReportService } from 'modules/finance/finance-report.service';
import { MembershipPaymentEntity } from 'modules/membership-payment/membership-payment.entity';
import { TransactionEntity } from 'modules/transaction/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, MembershipPaymentEntity]),
  ],
  providers: [FinanceReportService],
  controllers: [FinanceReportController],
})
export class FinanceReportModule {}
