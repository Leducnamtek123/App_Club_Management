import { Column, Entity, ManyToOne } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { TransactionDto } from './dtos/transaction.dto';
import { TransactionCategoryEntity } from '../transaction-category/transaction-category.entity';
import { FinanceEntity } from 'modules/finance/finance-report.abstract.entity';

@Entity({ name: 'transactions' })
@UseDto(TransactionDto)
export class TransactionEntity extends FinanceEntity<TransactionDto> {
  @ManyToOne(() => TransactionCategoryEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: TransactionCategoryEntity;

  @Column({ type: 'uuid', nullable: true })
  category_id?: string;
}
