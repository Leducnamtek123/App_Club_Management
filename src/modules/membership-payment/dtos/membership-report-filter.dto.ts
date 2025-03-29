// src/modules/membership-payment/dto/membership-payment.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from 'common/dto/abstract.dto';
import { BranchDto } from 'modules/branch/dtos/branch.dto';
import { UserDto } from 'modules/user/dtos/user.dto';

export class MembershipPaymentDto extends AbstractDto {
  @ApiProperty({ description: 'ID người dùng' })
  user_id!: Uuid;

  @ApiProperty({ description: 'Năm áp dụng' })
  year!: number;

  @ApiProperty({ description: 'Số tiền' })
  amount!: number;

  @ApiPropertyOptional({ description: 'Mô tả' })
  description?: string;

  @ApiPropertyOptional({ description: 'Chi hội', type: BranchDto })
  branch?: BranchDto;

  @ApiPropertyOptional({ description: 'Người tạo', type: UserDto })
  createdBy?: UserDto;
}
