import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterZaloDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code!: string;
  }