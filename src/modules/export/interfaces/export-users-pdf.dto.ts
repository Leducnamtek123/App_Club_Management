import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../../constants/user-status';
import { StringFieldOptional } from '../../../decorators/field.decorators';
import { Transform } from 'class-transformer';

export class ExportMembersPdfDto {
  @ApiPropertyOptional()
  @StringFieldOptional()
  branchId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @Transform(({ value }) => value as UserStatus)
  status?: UserStatus;
}
