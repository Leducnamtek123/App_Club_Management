import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RequestBranchDto {
  @ApiPropertyOptional({ description: 'Tên chi hội' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: 'Mô tả chi hội' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'ID của chi hội trưởng' })
  @IsString()
  @IsOptional()
  leaderId?: string;
}
