import { Entity, Column, Unique } from 'typeorm';
import { AbstractEntity } from '../../common/abstract.entity';
import { UseDto } from 'decorators/use-dto.decorator';
import { MembershipFeeDto } from 'modules/membership-fee/dtos/membership-fee.dto';

@Entity({ name: 'membership_fees' })
@Unique(['year'])
@UseDto(MembershipFeeDto)
export class MembershipFeeEntity extends AbstractEntity<MembershipFeeDto> {
  @Column({ type: 'int', nullable: false, unique: true })
  year!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: false })
  amount!: number;
}
