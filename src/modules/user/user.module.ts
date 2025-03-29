import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { MembershipPaymentModule } from '../membership-payment/membership-payment.module';
import { BranchEntity } from '../branch/branch.entity';
import { CloudinaryStorageService } from 'shared/services/cloudinary-storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, BranchEntity]),
    forwardRef(() => MembershipPaymentModule),
  ],
  controllers: [UserController],
  exports: [UserService],
  providers: [UserService,{ provide: 'IStorageService', useClass: CloudinaryStorageService }],
})
export class UserModule {}
