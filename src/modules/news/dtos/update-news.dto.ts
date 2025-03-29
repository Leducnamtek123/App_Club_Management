import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { NewsCategory } from '../../../constants/enum/news-category.enum';

export class UpdateNewsDto {
  @ApiPropertyOptional({ description: 'Title of the news', example: 'Updated Event Announcement' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Content of the news', example: 'Updated details...' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Publish status', example: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Category of the news', enum: NewsCategory, example: NewsCategory.ANNOUNCEMENT })
  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;
}