import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../modules/user/user.entity';
import { RoleType } from '../../../constants/role-type';
import { UserStatus } from '../../../constants/user-status';
import { Salutation } from '../../../constants/enum/salutation.enum';
import { Position } from '../../../constants/enum/position.enum';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    const adminEmail = 'admin@gmail.com';
    const adminphone = '0123456789';

    // Kiểm tra xem admin đã tồn tại chưa
    const adminExists = await this.userRepository.findOne({
      where: { email: adminEmail },
    });

    if (!adminExists) {
      const adminUser = this.userRepository.create({
        name: 'Super Admin',
        email: adminEmail,
        password: '123456',
        phone: adminphone,
        role: RoleType.SUPER_ADMIN,
        status: UserStatus.APPROVED,
        salutation: Salutation.MR,
        position: Position.CEO,
      });

      await this.userRepository.save(adminUser);

      console.log('✅ Admin account created successfully!');
    } else {
      console.log('⚠️ Admin account already exists.');
    }
  }
}
