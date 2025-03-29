import { AbstractDto } from '../../../common/dto/abstract.dto';
import {
  StringField,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { TransactionCategoryEntity } from '../transaction-category.entity';

export class TransactionCategoryDto extends AbstractDto {
  @StringField({ nullable: false })
  name!: string;

  @StringFieldOptional({ nullable: true })
  description?: string;

  constructor(entity: TransactionCategoryEntity) {
    super(entity);
    this.name = entity.name;
    this.description = entity.description;
  }
}
