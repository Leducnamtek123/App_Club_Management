import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipPaymentEntity } from './membership-payment.entity';
import { MembershipPaymentController } from './membership-payment.controller';
import { MembershipPaymentService } from './membership-payment.service';
import { UserModule } from '../user/user.module';
import { UserEntity } from '../user/user.entity';
import { MembershipFeeModule } from 'modules/membership-fee/membership-fee.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembershipPaymentEntity, UserEntity]),
    forwardRef(() => UserModule),
    MembershipFeeModule,
  ],
  providers: [MembershipPaymentService],
  controllers: [MembershipPaymentController],
})
export class MembershipPaymentModule {}
