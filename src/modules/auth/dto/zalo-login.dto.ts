// src/auth/dtos/zalo-login.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ZaloLoginDto {
  @ApiProperty({ description: 'Access token từ Zalo SDK' })
  @IsString()
  @IsNotEmpty()
  accessToken!: string;
}
