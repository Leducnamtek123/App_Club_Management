import { ApiPropertyOptional } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import { TransactionType } from '../../../constants/enum/transaction-type.enum';
import {
  StringFieldOptional,
  StringField,
  NumberField,
} from '../../../decorators/field.decorators';
import { TransactionCategoryDto } from '../../transaction-category/dtos/transaction-category.dto';
import { UserDto } from '../../user/dtos/user.dto';
import { TransactionEntity } from '../transaction.entity';
import { BranchDto } from 'modules/branch/dtos/branch.dto';

export class TransactionDto extends AbstractDto {

  @StringFieldOptional({ nullable: true })
  category_id?: string;

  @StringField({ nullable: false })
  type!: TransactionType;

  @NumberField({ nullable: false })
  amount!: number;

  @StringFieldOptional({ nullable: true })
  description?: string;

  user?: UserDto;
  category?: TransactionCategoryDto;

  @ApiPropertyOptional({ description: 'Chi hội', type: BranchDto })
  branch?: BranchDto;

  @ApiPropertyOptional({ description: 'Người tạo', type: UserDto })
  createdBy?: UserDto;

  constructor(entity: TransactionEntity) {
    super(entity);
    this.category_id = entity.category_id;
    this.type = entity.type;
    this.amount = entity.amount;
    this.description = entity.description;
    this.category = entity.category
      ? new TransactionCategoryDto(entity.category)
      : undefined;
    this.branch = entity.branch?.toDto();
    this.createdBy = entity.createdBy?.toDto();
  }
}
