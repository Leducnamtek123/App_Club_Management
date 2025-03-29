// src/modules/membership-payment/dtos/membership-payment-report.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dtos/user.dto';

export class PaymentStatusDto {
  @ApiProperty({ description: 'Năm' })
  year!: number;

  @ApiProperty({
    description: 'Trạng thái: -1 (chưa tham gia), 1 (đã đóng), 0 (chưa đóng)',
  })
  status!: number;
}

export class MembershipPaymentReportDto {
  @ApiProperty({ type: () => UserDto })
  user: UserDto;

  @ApiProperty({
    type: [PaymentStatusDto],
    description: 'Danh sách trạng thái đóng phí theo năm',
  })
  payments: PaymentStatusDto[];

  constructor(user: UserDto, payments: PaymentStatusDto[]) {
    this.user = user;
    this.payments = payments;
  }
}
