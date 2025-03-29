import { ApiProperty } from '@nestjs/swagger';
import { AbstractDto } from '../../../common/dto/abstract.dto';
import {
  StringField,
} from '../../../decorators/field.decorators';
import { UserEntity } from '../user.entity';

export class UserSimpleDto extends AbstractDto {
  @StringField({ nullable: false })
  name!: string;

  @ApiProperty()
  @StringField({ nullable: true })
  zaloId?: string | null;

  @StringField({ nullable: true })
  phone?: string | null;

  @StringField({ nullable: true })
  email?: string | null;

  @StringField({ nullable: true })
  companyName?: string | null;

  @StringField({ nullable: true })
  position!: string;

  constructor(user: UserEntity) {
    super(user);
    this.name = user.name;
    this.phone = user.phone;
    this.zaloId = user.zaloId;
    this.email = user.email;
    this.companyName = user.companyName;
    this.position = user.position;
  }
}
