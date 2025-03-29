import { UserStatus } from './../../../constants/user-status';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';
import { StringFieldOptional } from '../../../decorators/field.decorators';
import { IsEnum, IsOptional } from 'class-validator';
import { RoleType } from '../../../constants/role-type';

export class UsersPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @StringFieldOptional()
  branchId?: string;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, {
    message: 'Status phải là một giá trị hợp lệ trong UserStatus',
  })
  @Transform(({ value }: TransformFnParams) => {
    if (value && typeof value === 'string') {
      const status = value.toUpperCase() as keyof typeof UserStatus;
      return UserStatus[status] || undefined;
    }
    return undefined;
  })
  status?: UserStatus;

  @ApiPropertyOptional({ enum: RoleType })
  @IsOptional()
  @IsEnum(RoleType, {
    message: 'Role phải là một giá trị hợp lệ trong RoleType',
  })
  role?: RoleType;
}
