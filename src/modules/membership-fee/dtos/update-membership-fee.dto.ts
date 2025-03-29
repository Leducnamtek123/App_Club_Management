import { ApiProperty } from '@nestjs/swagger';
import { NumberField } from '../../../decorators/field.decorators';

export class UpdateMembershipFeeDto {
  @ApiProperty({
    description: 'Số tiền phí',
    example: 1000000,
  })
  @NumberField({ minimum: 0 })
  amount!: number;
}
