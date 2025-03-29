import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { FindOptionsWhere } from 'typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { UserStatus } from '../../constants/user-status';
import { FileNotImageException } from '../../exceptions/file-not-image.exception';
import { UserNotFoundException } from '../../exceptions/user-not-found.exception';
import { ValidatorService } from '../../shared/services/validator.service';
import { Reference } from '../../types';
import { UserRegisterDto } from '../auth/dto/user-register.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserDto } from './dtos/user.dto';
import { UsersPageOptionsDto } from './dtos/users-page-options.dto';
import { UserEntity } from './user.entity';
import { PdfData } from '../export/interfaces/pdf-data.interface';
import { ExportMembersPdfDto } from '../export/interfaces/export-users-pdf.dto';
import axios from 'axios';
import { BranchEntity } from '../branch/branch.entity';
import { IStorageService } from 'interfaces/IStorageService';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
    private validatorService: ValidatorService,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    
  ) {}

  async findOne(
    findData: FindOptionsWhere<UserEntity>,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: findData,
      relations: ['branch'],
    });
  }

  async findByUsernameOrEmail(
    options: Partial<{ username: string; email: string }>,
  ): Promise<UserEntity | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (options.email) {
      queryBuilder.orWhere('user.email = :email', { email: options.email });
    }

    if (options.username) {
      queryBuilder.orWhere('user.username = :username', {
        username: options.username,
      });
    }

    return queryBuilder.getOne();
  }

  @Transactional()
  async createUser(
    userRegisterDto: UserRegisterDto,
    file?: Reference<Express.Multer.File>, // Đổi sang Express.Multer.File để đồng bộ
  ): Promise<UserEntity> {
    const { email, phone, zaloAccessToken, branchId, referrerName, role = RoleType.USER } = userRegisterDto;

    if (email) {
      const existingEmail = await this.userRepository.findOne({ where: { email } });
      if (existingEmail) {
        throw new ConflictException({ message: 'Email already exists.', field: 'email' });
      }
    }

    if (phone) {
      const existingPhone = await this.userRepository.findOne({ where: { phone } });
      if (existingPhone) {
        throw new ConflictException({ message: 'Phone number already exists.', field: 'phone' });
      }
    }

    let zaloId: string | undefined;
    if (zaloAccessToken) {
      try {
        const response = await axios.get('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
          headers: { Authorization: `Bearer ${zaloAccessToken}` },
        });
        zaloId = response.data.id;
        const existingZaloId = await this.userRepository.findOne({ where: { zaloId } });
        if (existingZaloId) {
          throw new ConflictException({ message: 'Zalo ID already exists.', field: 'zaloId' });
        }
      } catch (error) {
        throw new ConflictException({ message: 'Invalid Zalo access token', field: 'zaloAccessToken' });
      }
    }

    const user = this.userRepository.create({
      ...userRegisterDto,
      zaloId: zaloId || null,
      role,
      referrerName,
    });

    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }
    if (file) {
      user.avatar = await this.storageService.uploadFile(file, `users/${user.id}/avatars`);
    }

    if (role === RoleType.ADMIN && branchId) {
      const branch = await this.branchRepository.findOneOrFail({ where: { id: branchId as Uuid } });
      if (!branch) throw new BadRequestException('Branch Not Found!');
      if (branch.leader) throw new BadRequestException('This branch already has a leader');
      branch.leader = user;
      await this.branchRepository.save(branch);
    }

    await this.userRepository.save(user);
    return user;
  }

  async getUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch');

    if (pageOptionsDto.branchId) {
      queryBuilder.where('user.branchId = :branchId', {
        branchId: pageOptionsDto.branchId,
      }); // Đổi branch_id thành branchId
    }

    if (pageOptionsDto.status) {
      queryBuilder.andWhere('user.status = :status', {
        status: pageOptionsDto.status,
      });
    }

    if (pageOptionsDto.q) {
      queryBuilder.andWhere(
        `(user.name ILIKE :q OR user.companyName ILIKE :q)`,
        { q: `%${pageOptionsDto.q}%` },
      );
    }

    if (pageOptionsDto.role) {
      queryBuilder.andWhere('user.role = :role', { role: pageOptionsDto.role });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');
    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);

    return items.toPageDto(pageMetaDto);
  }

  async getUser(userId: Uuid): Promise<UserDto> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      throw new UserNotFoundException();
    }
    return user.toDto();
  }

  async getPendingUsers(
    pageOptionsDto: UsersPageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch')
      .where('user.status = :status', { status: UserStatus.PENDING });

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    return items.toPageDto(pageMetaDto);
  }

  async updateUser(
    userId: Uuid,
    updateUserDto: UpdateUserDto,
    currentUser: UserEntity,
    file?: Reference<Express.Multer.File>, // Thêm file upload
  ): Promise<UserDto> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.id !== userId && currentUser.role !== RoleType.ADMIN) {
      throw new ForbiddenException('You are not allowed to update this profile');
    }

    if (user.status !== UserStatus.APPROVED) {
      throw new BadRequestException('Only approved users can update their profile');
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const emailExists = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
      if (emailExists) {
        throw new BadRequestException('Email is already in use');
      }
    }

    Object.assign(user, updateUserDto);

    // Xử lý file avatar (nếu có)
    if (file && !this.validatorService.isImage(file.mimetype)) {
      throw new FileNotImageException();
    }
    if (file) {
      user.avatar = await this.storageService.uploadFile(file, `users/${userId}/avatars`);
    }

    const updatedUser = await this.userRepository.save(user);
    return updatedUser.toDto();
  }

  async approveUser(userId: Uuid): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === UserStatus.APPROVED) {
      throw new BadRequestException('User already approved');
    }
    user.status = UserStatus.APPROVED;
    await this.userRepository.save(user);
  }

  async refuseUser(userId: Uuid): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.status === UserStatus.REJECTED) {
      throw new BadRequestException('User already refused');
    }
    user.status = UserStatus.REJECTED;
    await this.userRepository.save(user);
  }

  async deleteUser(userId: Uuid): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  async saveRefreshToken(
    userId: Uuid,
    refreshToken: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, { refreshToken });
  }

  async updatePassword(userId: Uuid, password: string): Promise<void> {
    console.log('password: ', password);
    await this.userRepository.update(userId, { password });
  }

  async getUsersByBranch(
    branchId: string,
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<UserDto>> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch')
      .where('user.branchId = :branchId', { branchId }) // Đổi branch_id thành branchId
      .orderBy('user.createdAt', 'DESC');

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    console.log('items', items);
    return items.toPageDto(pageMetaDto);
  }

  async getMembersForPdf(dto: ExportMembersPdfDto): Promise<PdfData> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch');

    if (dto.branchId) {
      // Đổi branch_id thành branchId
      queryBuilder.andWhere('user.branchId = :branchId', {
        branchId: dto.branchId,
      });
    }

    const users = await queryBuilder.getMany();

    const rows = users.map((user, index) => ({
      stt: (index + 1).toString(),
      name: user.name,
      branch: user.branch?.name || 'Không xác định',
      company: user.companyName || 'N/A', // Đảm bảo lấy companyName
      phone: user.phone || 'N/A',
    }));

    return {
      title: 'Danh sách toàn bộ thành viên',
      headers: ['STT', 'Tên', 'Chi hội', 'Doanh nghiệp', 'Số điện thoại'],
      rows,
    };
  }
}
