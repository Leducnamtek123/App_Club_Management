import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCategoryEntity } from '../transaction-category/transaction-category.entity';
import { TransactionEntity } from './transaction.entity';
import { Module } from '@nestjs/common';
import { TransactionController } from 'modules/transaction/transaction.controller';
import { TransactionService } from 'modules/transaction/transaction.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, TransactionCategoryEntity]),
  ],
  controllers: [TransactionController],
  exports: [TransactionService],
  providers: [TransactionService],
})
export class TransactionModule {}
