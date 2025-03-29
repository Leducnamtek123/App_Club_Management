import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer'; // Thêm import Transform
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { StringFieldOptional } from '../../../decorators/field.decorators';
import { NewsCategory } from '../../../constants/enum/news-category.enum';

export class NewsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Filter by author ID', example: '80ce8c56-a8df-4c74-b9ce-4412243bf4bc' })
  @StringFieldOptional()
  authorId?: string;

  @ApiPropertyOptional({ description: 'Filter by publish status', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Search by title', example: 'Event' })
  @StringFieldOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by category', enum: NewsCategory, example: NewsCategory.EVENT })
  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;
}