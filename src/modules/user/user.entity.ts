// src/modules/user/user.entity.ts
import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { UserDto } from './dtos/user.dto';
import { AbstractEntity } from '../../common/abstract.entity';
import { RoleType } from '../../constants/role-type';
import { UserStatus } from '../../constants/user-status';
import { BranchEntity } from '../branch/branch.entity';
import { MembershipPaymentEntity } from '../membership-payment/membership-payment.entity';
import { Salutation } from '../../constants/enum/salutation.enum';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class UserEntity extends AbstractEntity<UserDto> {
  @Column({ type: 'varchar', nullable: false })
  name!: string;

  @Column({ type: 'enum', enum: RoleType, default: RoleType.USER })
  role!: RoleType;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  email!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  password!: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  phone!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  avatar!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  refreshToken?: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  zaloId?: string | null;

  @Column({ type: 'varchar', nullable: true })
  companyName!: string;

  @Column({ type: 'varchar', nullable: true })
  address!: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: Date | null;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status!: UserStatus;

  @Column({ type: 'varchar', nullable: false })
  position!: string;

  @Column({
    type: 'enum',
    enum: Salutation,
    nullable: false,
  })
  salutation!: Salutation;

  @ManyToOne(() => BranchEntity, (branch) => branch.members, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'branch_id' })
  branch?: BranchEntity;

  @Column({ type: 'uuid', nullable: true })
  branchId?: Uuid;

  @OneToMany(
    () =>
      require('../membership-payment/membership-payment.entity')
        .MembershipPaymentEntity,
    (payment: MembershipPaymentEntity) => payment.user,
  )
  payments!: MembershipPaymentEntity[];
  @OneToMany('NewsEntity', (news: any) => news.author)
  news!: any[];
  @Column({ type: 'varchar', nullable: true })
  referrerName?: string;
}
