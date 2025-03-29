import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { UserEntity } from '../user/user.entity';
import { NewsPageOptionsDto } from './dtos/news-page-options.dto';
import { NewsDto } from './dtos/news.dto';
import { NewsEntity } from './news.entity';
import { CreateNewsDto } from './dtos/create-news.dto';
import { UpdateNewsDto } from './dtos/update-news.dto';
import { Reference } from 'types';
import { FileNotImageException } from 'exceptions/file-not-image.exception';
import { ValidatorService } from 'shared/services/validator.service';
import { IStorageService } from 'interfaces/IStorageService';


@Injectable()
export class NewsService {
    constructor(
        @InjectRepository(NewsEntity)
        private readonly newsRepository: Repository<NewsEntity>,
        private validatorService: ValidatorService,
        @Inject('IStorageService')
        private readonly storageService: IStorageService,
    ) { }

    async getNews(pageOptionsDto: NewsPageOptionsDto): Promise<PageDto<NewsDto>> {
        const queryBuilder = this.newsRepository
            .createQueryBuilder('news')
            .leftJoinAndSelect('news.author', 'author');

        if (pageOptionsDto.authorId) {
            queryBuilder.andWhere('news.authorId = :authorId', { authorId: pageOptionsDto.authorId });
        }

        if (pageOptionsDto.isPublished !== undefined) {
            queryBuilder.andWhere('news.isPublished = :isPublished', { isPublished: pageOptionsDto.isPublished });
        }

        if (pageOptionsDto.q) {
            queryBuilder.andWhere('news.title ILIKE :q', { q: `%${pageOptionsDto.q}%` });
        }

        // Thêm lọc theo category
        if (pageOptionsDto.category) {
            queryBuilder.andWhere('news.category = :category', { category: pageOptionsDto.category });
        }

        queryBuilder.orderBy('news.createdAt', 'DESC');
        const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

        return items.toPageDto(pageMetaDto);
    }
    async getNewsById(newsId: string): Promise<NewsDto> {
        const news = await this.newsRepository.findOne({
            where: { id: newsId as any },
            relations: ['author'],
        });
        if (!news) {
            throw new NotFoundException('News not found');
        }
        return news.toDto();
    }
    async createNews(
        createNewsDto: CreateNewsDto,
        user: UserEntity,
        file?: Reference<Express.Multer.File>,
    ): Promise<NewsDto> {
        const news = this.newsRepository.create({
            ...createNewsDto,
            author: user,
            authorId: user.id,
            isPublished: false,
            category: createNewsDto.category,
        });

        // Xử lý file thumbnail (nếu có)
        if (file && !this.validatorService.isImage(file.mimetype)) {
            throw new FileNotImageException();
        }
        if (file) {
            news.thumbnail = await this.storageService.uploadFile(file, `news/${user.id}/thumbnails`);
        }

        const savedNews = await this.newsRepository.save(news);
        return savedNews.toDto();
    }

    async updateNews(
        newsId: string,
        updateNewsDto: UpdateNewsDto,
        user: UserEntity,
        file?: Reference<Express.Multer.File>,
      ): Promise<NewsDto> {
        const news = await this.newsRepository.findOne({
          where: { id: newsId as Uuid },
          relations: ['author'],
        });
        if (!news) {
          throw new NotFoundException('News not found');
        }
    
        if (user.role !== RoleType.ADMIN) {
          throw new ForbiddenException('Only admins can update news');
        }
    
        if (updateNewsDto.isPublished !== undefined && updateNewsDto.isPublished && !news.isPublished) {
          news.publishedAt = new Date();
        } else if (updateNewsDto.isPublished === false) {
          news.publishedAt = null;
        }
    
        Object.assign(news, updateNewsDto);
    
        // Xử lý file thumbnail (nếu có)
        if (file && !this.validatorService.isImage(file.mimetype)) {
          throw new FileNotImageException();
        }
        if (file) {
          news.thumbnail = await this.storageService.uploadFile(file, `news/${user.id}/thumbnails`);
        }
    
        const updatedNews = await this.newsRepository.save(news);
        return updatedNews.toDto();
      }

    async deleteNews(newsId: string): Promise<void> {
        const news = await this.newsRepository.findOne({ where: { id: newsId as Uuid } });
        if (!news) {
            throw new NotFoundException('News not found');
        }
        await this.newsRepository.remove(news);
    }
}