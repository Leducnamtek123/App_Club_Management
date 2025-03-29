import { AbstractDto } from '../../../common/dto/abstract.dto';
import { StringField, BooleanFieldOptional, EnumFieldOptional } from '../../../decorators/field.decorators';
import { NewsEntity } from '../news.entity';
import { UserSimpleDto } from '../../user/dtos/user-simple.dto';
import { NewsCategory } from '../../../constants/enum/news-category.enum';

export class NewsDto extends AbstractDto {
  @StringField({ nullable: false })
  title!: string;

  @StringField({ nullable: false })
  content!: string;

  @StringField({ nullable: true })
  thumbnail?: string | null;

  @BooleanFieldOptional()
  isPublished!: boolean;

  @StringField({ nullable: true })
  publishedAt?: Date | null;

  author!: UserSimpleDto;

  // Thêm trường category
  @EnumFieldOptional(() => NewsCategory)
  category!: NewsCategory;

  constructor(news: NewsEntity) {
    super(news);
    this.title = news.title;
    this.content = news.content;
    this.thumbnail = news.thumbnail;
    this.isPublished = news.isPublished;
    this.publishedAt = news.publishedAt;
    this.author = news.author.toDto();
    this.category = news.category;
  }
}