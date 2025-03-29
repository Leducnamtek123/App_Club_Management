import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../user/user.entity';
import { NewsController } from './news.controller';
import { NewsEntity } from './news.entity';
import { NewsService } from './news.service';
import { CloudinaryStorageService } from 'shared/services/cloudinary-storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsEntity, UserEntity])],
  controllers: [NewsController],
  providers: [NewsService,{ provide: 'IStorageService', useClass: CloudinaryStorageService }],
  exports: [NewsService],
})
export class NewsModule {}