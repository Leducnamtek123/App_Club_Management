import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from '../../decorators/use-dto.decorator';
import { TransactionCategoryDto } from './dtos/transaction-category.dto';

@Entity({ name: 'transaction_categories' })
@UseDto(TransactionCategoryDto)
export class TransactionCategoryEntity extends AbstractEntity<TransactionCategoryDto> {
  @Column({ type: 'varchar', unique: true, nullable: false })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;
}
