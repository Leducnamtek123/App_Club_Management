// src/modules/membership-payment/dtos/membership-payment-report-options.dto.ts
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PageOptionsDto } from '../../../common/dto/page-options.dto';

export class MembershipPaymentReportOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({ description: 'Năm bắt đầu' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  startYear?: number;

  @ApiPropertyOptional({ description: 'Năm kết thúc' })
  @IsOptional()
  @IsInt()
  @Min(2000)
  @Type(() => Number)
  endYear?: number;

  @ApiPropertyOptional({ description: 'ID chi hội' })
  @IsOptional()
  @IsString()
  branchId?: string;

  @ApiPropertyOptional({ description: 'ID người dùng' })
  @IsOptional()
  @IsString()
  userId?: string;
}
