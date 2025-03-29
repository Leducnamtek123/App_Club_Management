import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  PasswordField,
  StringField,
} from '../../../decorators/field.decorators';
import { Position } from '../../../constants/enum/position.enum';
import { Salutation as Salutation } from '../../../constants/enum/salutation.enum';
import { RoleType } from '../../../constants/role-type';

export class UserRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(13)
  phone!: string;

  @ApiPropertyOptional()
  @PasswordField({ minLength: 6 })
  readonly password?: string;

  @ApiProperty()
  @StringField()
  readonly name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zaloAccessToken?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional()
  @StringField()
  readonly companyName?: string;

  @ApiPropertyOptional()
  @StringField()
  readonly address?: string;

  @ApiProperty({ description: 'Chức vụ', enum: Position })
  @IsEnum(Position)
  @IsNotEmpty()
  position!: Position;

  @ApiProperty({ description: 'Nhân xưng', enum: Salutation })
  @IsEnum(Salutation)
  @IsNotEmpty()
  salutation!: Salutation;

  @ApiPropertyOptional({
    description: 'Ngày tháng năm sinh',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    description: 'Vai trò',
    enum: RoleType,
    default: RoleType.USER,
  })
  @IsEnum(RoleType)
  @IsOptional()
  role?: RoleType;
  
  @ApiProperty({ description: 'Tên người giới thiệu', required: false })
  @StringField({ nullable: true })
  referrerName?: string;
}
