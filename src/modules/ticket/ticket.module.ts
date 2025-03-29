// src/modules/ticket/ticket.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';
import { EventEntity } from '../event/event.entity';
import { UserEntity } from '../user/user.entity';
import { ZnsService } from '../zns/zns.service';
import { TicketEntity } from './ticket.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TicketEntity, UserEntity, EventEntity]),
    HttpModule,
    BullModule.registerQueue({ name: 'zns' }),
  ],
  providers: [TicketService, ZnsService],
  controllers: [TicketController],
})
export class TicketModule {}
