import { AbstractDto } from '../../../common/dto/abstract.dto';
import { Salutation } from '../../../constants/enum/salutation.enum';
import { RoleType } from '../../../constants/role-type';
import { UserStatus } from '../../../constants/user-status';
import {
  StringField,
  EnumFieldOptional,
  EmailFieldOptional,
  PhoneFieldOptional,
  StringFieldOptional,
} from '../../../decorators/field.decorators';
import { BranchDto } from '../../branch/dtos/branch.dto';
import { UserEntity } from '../user.entity';

export class UserDto extends AbstractDto {
  @StringField({ nullable: false })
  name!: string;

  @EnumFieldOptional(() => RoleType)
  role?: RoleType;

  @EmailFieldOptional({ nullable: true })
  email?: string | null;

  @PhoneFieldOptional({ nullable: true })
  phone?: string | null;

  @StringFieldOptional({ nullable: true })
  avatar?: string | null;

  @StringField({ nullable: true })
  zaloId?: string | null;

  @EnumFieldOptional(() => UserStatus)
  status!: UserStatus;

  @EnumFieldOptional(() => Salutation)
  salutation!: Salutation;

  @StringField({ nullable: true })
  position!: string;

  @StringField({ nullable: true })
  companyName?: string;

  @StringField({ nullable: true })
  address?: string;

  branch?: BranchDto | null;

  constructor(user: UserEntity) {
    super(user);
    this.name = user.name;
    this.role = user.role;
    this.email = user.email;
    this.phone = user.phone;
    this.avatar = user.avatar;
    this.zaloId = user.zaloId;
    this.status = user.status;
    this.salutation = user.salutation;
    this.position = user.position;
    this.address = user.address;
    this.companyName = user.companyName;
    this.branch = user.branch ? new BranchDto(user.branch) : null;
  }
}
