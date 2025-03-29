import { IsOptional, ValidateIf } from 'class-validator';
import { StringField } from '../../../decorators/field.decorators';

export class UserLoginDto {
  @StringField()
  @IsOptional()
  @ValidateIf((o) => !o.phone) // Required if phone is not available
  email?: string;

  @StringField()
  @IsOptional()
  @ValidateIf((o) => !o.email) // Required if email is not available
  phone?: string;

  @StringField()
  password!: string;
}
