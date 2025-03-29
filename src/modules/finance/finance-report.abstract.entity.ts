import { Column, JoinColumn, ManyToOne } from 'typeorm';
import { TransactionType } from 'constants/enum/transaction-type.enum';
import { AbstractDto } from 'common/dto/abstract.dto';
import { AbstractEntity } from 'common/abstract.entity';
import { BranchEntity } from 'modules/branch/branch.entity';
import { UserEntity } from 'modules/user/user.entity';

export abstract class FinanceEntity<
  T extends AbstractDto = AbstractDto,
> extends AbstractEntity<T> {
  @Column({ type: 'varchar', nullable: false })
  type!: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount!: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @ManyToOne(() => BranchEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch?: BranchEntity;

  @Column({ type: 'uuid', nullable: true })
  branch_id?: string;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: UserEntity;
}
