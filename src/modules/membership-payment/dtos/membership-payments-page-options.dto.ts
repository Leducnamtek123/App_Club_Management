import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class MembershipPaymentsPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'ID chi nhánh' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Năm áp dụng' })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ description: 'ID hội viên' })
  @IsOptional()
  @IsString()
  userId?: string;
}
