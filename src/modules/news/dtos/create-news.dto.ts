import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { NewsCategory } from '../../../constants/enum/news-category.enum';

export class CreateNewsDto {
  @ApiProperty({ description: 'Title of the news', example: 'New Event Announcement' })
  @IsString()
  @IsNotEmpty()
  title?: string;

  @ApiProperty({ description: 'Content of the news', example: 'Details about the upcoming event...' })
  @IsString()
  @IsNotEmpty()
  content?: string;

  // Thêm trường category
  @ApiProperty({ description: 'Category of the news', enum: NewsCategory, example: NewsCategory.EVENT })
  @IsEnum(NewsCategory)
  @IsNotEmpty()
  category?: NewsCategory;
}