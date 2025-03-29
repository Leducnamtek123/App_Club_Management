import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { ZnsService } from './zns.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    BullModule.registerQueue({
      name: 'zns', // Đăng ký queue "zns"
    }),
  ],
  providers: [ZnsService],
  exports: [ZnsService], // Export ZnsService để module khác sử dụng
})
export class ZnsModule {}
