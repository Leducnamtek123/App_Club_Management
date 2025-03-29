import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UseDto } from '../../decorators/use-dto.decorator';
import { AbstractEntity } from '../../common/abstract.entity';
import { NewsDto } from './dtos/news.dto';
import { NewsCategory } from '../../constants/enum/news-category.enum';

@Entity({ name: 'news' })
@UseDto(NewsDto)
export class NewsEntity extends AbstractEntity<NewsDto> {
  @Column({ type: 'varchar', nullable: false })
  title!: string;

  @Column({ type: 'text', nullable: false })
  content!: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail!: string | null;

  @Column({ type: 'boolean', default: false })
  isPublished!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @ManyToOne('UserEntity', (user: any) => user.news, {
    nullable: false,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'author_id' })
  author!: any;

  @Column({ type: 'uuid', nullable: false })
  authorId!: string;

  // Thêm trường category
  @Column({
    type: 'enum',
    enum: NewsCategory,
    default: NewsCategory.GENERAL,
  })
  category!: NewsCategory;

  constructor(partial: Partial<NewsEntity>) {
    super();
    Object.assign(this, partial);
  }
}