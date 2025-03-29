import { ApiProperty } from '@nestjs/swagger';
import { NumberField } from 'decorators/field.decorators';

export class CreateMembershipFeeDto {
  @ApiProperty({ description: 'Năm áp dụng', example: 2023 })
  @NumberField({ nullable: false, minimum: 2000, maximum: 2200 })
  year!: number;

  @ApiProperty({ description: 'Số tiền phí', example: 1000000 })
  @NumberField({ nullable: false, minimum: 0 })
  amount!: number;
}
