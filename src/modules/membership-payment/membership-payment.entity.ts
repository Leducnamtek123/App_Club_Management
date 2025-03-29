import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { UserEntity } from '../user/user.entity';
import { MembershipPaymentDto } from './dtos/membership-payment.dto';
import { TransactionType } from 'constants/enum/transaction-type.enum';
import { FinanceEntity } from 'modules/finance/finance-report.abstract.entity';

@Entity({ name: 'membership_payments' })
@Unique(['user_id', 'year'])
@UseDto(MembershipPaymentDto)
export class MembershipPaymentEntity extends FinanceEntity<MembershipPaymentDto> {
  @ManyToOne(() => UserEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'uuid', nullable: false })
  user_id!: string;

  @Column({ type: 'int', nullable: false })
  year!: number;

  @Column({
    type: 'varchar',
    nullable: false,
    default: TransactionType.INCOME,
  })
  type: TransactionType = TransactionType.INCOME;
}
