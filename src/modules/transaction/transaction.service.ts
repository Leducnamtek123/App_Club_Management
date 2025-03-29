// src/modules/finance/finance.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { PageDto } from 'common/dto/page.dto';
import { CreateTransactionDto } from 'modules/transaction/dtos/create-transaction.dto';
import { TransactionDto } from 'modules/transaction/dtos/transaction.dto';
import { TransactionsPageOptionsDto } from 'modules/transaction/dtos/transactions-page-options.dto';
import { UserEntity } from 'modules/user/user.entity';
import { UpdateTransactionDto } from 'modules/transaction/dtos/update-transaction.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
  ) {}

  async createTransaction(
    data: CreateTransactionDto,
    user: UserEntity,
  ): Promise<TransactionDto> {
    const transactionData = {
      type: data.type,
      amount: data.amount,
      description: data.description,
      branch: data.branchId
        ? ({ id: data.branchId } as any)
        : user?.branch || undefined,
      branch_id: data.branchId || user?.branch?.id || user?.branchId,
      createdBy: user,
      created_by_id: user.id,
    };

    const transaction = this.transactionRepo.create(transactionData);
    const savedTransaction = await this.transactionRepo.save(transaction);
    return savedTransaction.toDto();
  }

  async getAllTransactions(
    pageOptionsDto: TransactionsPageOptionsDto,
  ): Promise<PageDto<TransactionDto>> {
    const queryBuilder = this.transactionRepo
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.branch', 'branch')
      .leftJoinAndSelect('transaction.createdBy', 'createdBy');

    if (pageOptionsDto.user_id) {
      queryBuilder.andWhere('transaction.user_id = :user_id', {
        user_id: pageOptionsDto.user_id,
      });
    }

    if (pageOptionsDto.type) {
      queryBuilder.andWhere('transaction.type = :type', {
        type: pageOptionsDto.type,
      });
    }

    if (pageOptionsDto.branch_id) {
      queryBuilder.andWhere('transaction.branch_id = :branch_id', {
        branch_id: pageOptionsDto.branch_id,
      });
    }

    if (pageOptionsDto.startDate || pageOptionsDto.endDate) {
      queryBuilder.andWhere(
        'transaction.createdAt BETWEEN :startDate AND :endDate',
        {
          startDate: pageOptionsDto.startDate || new Date(0),
          endDate: pageOptionsDto.endDate || new Date(),
        },
      );
    }

    queryBuilder.orderBy(
      'transaction.createdAt',
      pageOptionsDto.order || 'DESC',
    );

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getTransactionById(id: Uuid): Promise<TransactionDto> {
    const transaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['branch', 'createdBy'],
    });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với ID ${id}`);
    }

    return transaction.toDto();
  }

  async updateTransaction(
    id: Uuid,
    data: UpdateTransactionDto,
  ): Promise<TransactionDto> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với ID ${id}`);
    }

    const updatedData: Partial<TransactionEntity> = {
      type: data.type || transaction.type,
      amount: data.amount !== undefined ? data.amount : transaction.amount,
      description:
        data.description !== undefined
          ? data.description
          : transaction.description,
      branch: data.branch_id
        ? ({ id: data.branch_id } as any)
        : transaction.branch,
      branch_id: data.branch_id || transaction.branch_id,
    };

    await this.transactionRepo.update(id, updatedData);
    const updatedTransaction = await this.transactionRepo.findOne({
      where: { id },
      relations: ['branch', 'createdBy'],
    });

    return updatedTransaction!.toDto();
  }

  async deleteTransaction(id: Uuid): Promise<void> {
    const transaction = await this.transactionRepo.findOne({ where: { id } });

    if (!transaction) {
      throw new NotFoundException(`Không tìm thấy giao dịch với ID ${id}`);
    }

    await this.transactionRepo.delete(id);
  }
}
