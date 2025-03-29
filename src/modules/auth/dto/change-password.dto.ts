import { IsUUID, IsString, MinLength } from 'class-validator';
import { StringField } from '../../../decorators/field.decorators';

export class ChangePasswordDto {
  @IsUUID()
  @StringField()
  userId!: Uuid;

  @IsString()
  @MinLength(6)
  @StringField()
  newPassword!: string;
}
