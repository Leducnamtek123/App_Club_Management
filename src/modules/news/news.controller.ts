import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query, UploadedFile, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { ApiPageResponse } from '../../decorators/api-page-response.decorator';
import { Auth, UUIDParam } from '../../decorators/http.decorators';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UserEntity } from '../user/user.entity';
import { CreateNewsDto } from './dtos/create-news.dto';
import { NewsDto } from './dtos/news.dto';
import { NewsPageOptionsDto } from './dtos/news-page-options.dto';
import { UpdateNewsDto } from './dtos/update-news.dto';
import { NewsService } from './news.service';
import { ApiFile } from 'decorators/swagger.schema';
import { Reference } from 'types';

@Controller('news')
@ApiTags('News')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPageResponse({ description: 'Get news list', type: PageDto })
  getNews(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: NewsPageOptionsDto,
  ): Promise<PageDto<NewsDto>> {
    return this.newsService.getNews(pageOptionsDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'Get news by ID', type: NewsDto })
  @ApiParam({ name: 'id', type: String, description: 'News ID (UUID)' })
  getNewsById(@UUIDParam('id') newsId: string): Promise<NewsDto> {
    return this.newsService.getNewsById(newsId);
  }

  @Post()
  @Auth([RoleType.ADMIN, RoleType.SUPER_ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: HttpStatus.CREATED, description: 'News created successfully', type: NewsDto })
  @ApiBody({ type: CreateNewsDto, description: 'Data to create news' })
  @ApiFile({ name: 'thumbnail' })
  createNews(
    @Body() createNewsDto: CreateNewsDto,
    @AuthUser() user: UserEntity,
    @UploadedFile() file?: Reference<Express.Multer.File>,
  ): Promise<NewsDto> {
    return this.newsService.createNews(createNewsDto, user, file);
  }
  @Patch(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: HttpStatus.OK, description: 'News updated successfully', type: NewsDto })
  @ApiParam({ name: 'id', type: String, description: 'News ID (UUID)' })
  @ApiBody({ type: UpdateNewsDto, description: 'Data to update news' })
  updateNews(
    @UUIDParam('id') newsId: string,
    @Body() updateNewsDto: UpdateNewsDto,
    @AuthUser() user: UserEntity,
  ): Promise<NewsDto> {
    return this.newsService.updateNews(newsId, updateNewsDto, user);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'News deleted successfully' })
  @ApiParam({ name: 'id', type: String, description: 'News ID (UUID)' })
  deleteNews(@UUIDParam('id') newsId: string): Promise<void> {
    return this.newsService.deleteNews(newsId);
  }
}