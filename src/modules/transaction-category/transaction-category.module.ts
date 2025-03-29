import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionCategoryEntity } from '../transaction-category/transaction-category.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([TransactionCategoryEntity])],
  exports: [TypeOrmModule],
})
export class TransactionCategoryModule {}
