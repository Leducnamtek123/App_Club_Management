// src/modules/finance/dto/membership-fee.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from 'common/dto/abstract.dto';
import { NumberField } from 'decorators/field.decorators';
import { MembershipFeeEntity } from 'modules/membership-fee/membership-fee.entity';

export class MembershipFeeDto extends AbstractDto {
  @ApiProperty({ description: 'Năm áp dụng', example: 2023 })
  @NumberField({ nullable: false, minimum: 2000, maximum: 2200 })
  year!: number;

  @ApiProperty({ description: 'Số tiền phí', example: 1000000 })
  @NumberField({ nullable: false, minimum: 0 })
  amount!: number;

  constructor(entity: MembershipFeeEntity) {
    super(entity);
    this.year = entity.year;
    this.amount = entity.amount;
  }
}
