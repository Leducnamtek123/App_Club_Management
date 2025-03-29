import { ApiPropertyOptional } from '@nestjs/swagger';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { TransactionType } from '../../../constants/enum/transaction-type.enum';
import {
  StringFieldOptional,
  DateFieldOptional,
} from '../../../decorators/field.decorators';
import { Transform } from 'class-transformer';

export class TransactionsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    description: 'ID của hội viên',
  })
  @StringFieldOptional({ nullable: true })
  user_id?: string;

  @ApiPropertyOptional({
    description: 'ID của loại giao dịch',
  })
  @StringFieldOptional({ nullable: true })
  category_id?: string;

  @ApiPropertyOptional({
    description: 'Loại giao dịch',
    enum: TransactionType,
  })
  @Transform(({ value }: { value: string }) => value as TransactionType)
  type?: TransactionType;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu (ISO 8601)',
  })
  @DateFieldOptional({ nullable: true })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc (ISO 8601)',
  })
  @DateFieldOptional({ nullable: true })
  endDate?: Date;

  @ApiPropertyOptional({ description: 'ID chi hội' })
  @StringFieldOptional({ nullable: true })
  branch_id?: Uuid;
}
