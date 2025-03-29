import { StringField } from '../../../decorators/field.decorators';

export class RefreshTokenDto {
  @StringField()
  refreshToken!: string;
}
