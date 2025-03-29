import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchService } from './branch.service';
import { BranchController } from './branch.controller';
import { BranchEntity } from './branch.entity';
import { UserEntity } from '../user/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchEntity, UserEntity])],
  providers: [BranchService],
  controllers: [BranchController],
})
export class BranchModule {}
