import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  NumberField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { BranchDto } from 'modules/branch/dtos/branch.dto';
import { UserDto } from 'modules/user/dtos/user.dto';
import { MembershipPaymentEntity } from '../membership-payment.entity';

export class MembershipPaymentDto extends AbstractDto {
  user!: UserDto;

  @ApiProperty({ description: 'Năm áp dụng' })
  @NumberField({ nullable: false, minimum: 2000, maximum: 2200 })
  year!: number;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @StringFieldOptional({ nullable: true })
  description?: string;

  @ApiPropertyOptional({ description: 'Chi hội', type: BranchDto })
  branch?: BranchDto;

  @ApiPropertyOptional({ description: 'Người tạo', type: UserDto })
  createdBy?: UserDto | null;

  constructor(entity: MembershipPaymentEntity) {
    console.log('membership payment entity: ', entity);

    super(entity);
    this.user = new UserDto(entity.user);
    this.year = entity.year;
    this.description = entity.description;
    this.createdBy = entity.createdBy ? new UserDto(entity.createdBy) : null;
    console.log(this.user);
  }
}
