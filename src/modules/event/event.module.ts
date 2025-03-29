// src/modules/events/events.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './event.entity';
import { EventsService } from './event.service';
import { EventsController } from './event.controller';
import { CloudinaryStorageService } from '../../shared/services/cloudinary-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([EventEntity])],
  providers: [
    EventsService,
    { provide: 'IStorageService', useClass: CloudinaryStorageService },
  ],
  controllers: [EventsController],
})
export class EventsModule {}
