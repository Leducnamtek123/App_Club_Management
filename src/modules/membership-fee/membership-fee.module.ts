import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembershipFeeEntity } from './membership-fee.entity';
import { MembershipFeeService } from './membership-fee.service';
import { MembershipFeeController } from './membership-fee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MembershipFeeEntity])],
  providers: [MembershipFeeService],
  controllers: [MembershipFeeController],
  exports: [MembershipFeeService], 
})
export class MembershipFeeModule {}