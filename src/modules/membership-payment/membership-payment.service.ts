// src/modules/membership-payment/membership-payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPaymentEntity } from './membership-payment.entity';
import { MembershipFeeService } from '../membership-fee/membership-fee.service';
import { CreateMembershipPaymentDto } from 'modules/membership-payment/dtos/create-membership-payment.dto';
import { MembershipPaymentDto } from 'modules/membership-payment/dtos/membership-payment.dto';
import { UserEntity } from 'modules/user/user.entity';
import { PageDto } from '../../common/dto/page.dto';
import { MembershipPaymentsPageOptionsDto } from './dtos/membership-payments-page-options.dto';
import { MembershipPaymentReportOptionsDto } from './dtos/membership-payment-report-options.dto';
import { MembershipPaymentReportDto } from './dtos/membership-payment-report.dto';
import { UserDto } from '../user/dtos/user.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { UserStatus } from '../../constants/user-status';

@Injectable()
export class MembershipPaymentService {
  constructor(
    @InjectRepository(MembershipPaymentEntity)
    private readonly membershipPaymentRepo: Repository<MembershipPaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly membershipFeeService: MembershipFeeService,
  ) {}

  async createMembershipPayment(
    data: CreateMembershipPaymentDto,
  ): Promise<MembershipPaymentDto> {
    const existingPayment = await this.membershipPaymentRepo.findOne({
      where: { user_id: data.user_id, year: data.year },
    });
    if (existingPayment) {
      throw new BadRequestException(
        `Hội viên đã đóng phí cho năm ${data.year}`,
      );
    }

    let fee;
    try {
      fee = await this.membershipFeeService.getMembershipFeeByYear(data.year);
    } catch (error) {
      throw new BadRequestException(
        `Năm ${data.year} chưa có mức phí hội viên trong hệ thống`,
      );
    }

    console.log('fee', fee);

    const user = await this.userRepo.findOne({
      where: { id: data.user_id },
      relations: ['branch'],
    });

    if (!user) {
      throw new BadRequestException(
        `Không tìm thấy người dùng với ID ${data.user_id}`,
      );
    }

    const paymentData: Partial<MembershipPaymentEntity> = {
      user: { id: data.user_id } as UserEntity,
      year: data.year,
      amount: fee.amount,
      description: data.description,
      branch: user.branch,
      branch_id: user.branchId,
    };

    const payment = this.membershipPaymentRepo.create(paymentData);
    const savedPayment = await this.membershipPaymentRepo.save(payment);
    return savedPayment.toDto();
  }

  async getMembershipPaymentByUserAndYear(
    user_id: string,
    year: number,
  ): Promise<MembershipPaymentDto> {
    const payment = await this.membershipPaymentRepo.findOne({
      where: { user_id, year },
      relations: ['user', 'branch', 'createdBy'],
    });
    if (!payment) {
      throw new BadRequestException(
        `Không tìm thấy phí hội viên cho user ${user_id} năm ${year}`,
      );
    }
    return payment.toDto();
  }

  async getMembershipPayments(
    pageOptionsDto: MembershipPaymentsPageOptionsDto,
  ): Promise<PageDto<MembershipPaymentDto>> {
    const queryBuilder = this.membershipPaymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('user.branch', 'branch')
      .leftJoinAndSelect('payment.createdBy', 'createdBy')
      .where('user.status = :status', { status: UserStatus.APPROVED });
    if (pageOptionsDto.branchId) {
      queryBuilder.andWhere('branch.id = :branchId', {
        branchId: pageOptionsDto.branchId,
      });
    }

    if (pageOptionsDto.year) {
      queryBuilder.andWhere('payment.year = :year', {
        year: Number(pageOptionsDto.year),
      });
    }

    if (pageOptionsDto.userId) {
      queryBuilder.andWhere('user.id = :userId', {
        userId: pageOptionsDto.userId,
      });
    }

    queryBuilder.orderBy('payment.year', pageOptionsDto.order);

    const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
    console.log('items', items);
    return items.toPageDto(pageMetaDto);
  }

  async deleteMembershipPayment(user_id: string, year: number): Promise<void> {
    const payment = await this.membershipPaymentRepo.findOne({
      where: { user_id, year },
    });
    if (!payment) {
      throw new BadRequestException(
        `Không tìm thấy phí hội viên cho user ${user_id} năm ${year}`,
      );
    }
    await this.membershipPaymentRepo.delete({ user_id, year });
  }

  async getMembershipPaymentReport(
    reportOptionsDto: MembershipPaymentReportOptionsDto,
  ): Promise<PageDto<MembershipPaymentReportDto>> {
    const { branchId, userId, skip, take, order } = reportOptionsDto;
    let { startYear, endYear } = reportOptionsDto;

    // Xác định startYear và endYear nếu không được truyền
    if (!startYear || !endYear) {
      const [minYearResult, maxYearResult] = await Promise.all([
        this.membershipPaymentRepo
          .createQueryBuilder('payment')
          .select('MIN(payment.year)', 'minYear')
          .getRawOne(),
        this.membershipPaymentRepo
          .createQueryBuilder('payment')
          .select('MAX(payment.year)', 'maxYear')
          .getRawOne(),
      ]);

      const minYear = minYearResult?.minYear || 2000;
      const maxYear = maxYearResult?.maxYear || new Date().getFullYear();

      startYear = startYear || minYear;
      endYear = endYear || maxYear;
    }

    const userQueryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.branch', 'branch');

    if (branchId) {
      userQueryBuilder.andWhere('user.branchId = :branchId', { branchId });
    }
    if (userId) {
      userQueryBuilder.andWhere('user.id = :userId', { userId });
    }

    userQueryBuilder.orderBy('user.createdAt', order);

    const totalUsers = await userQueryBuilder.getCount();
    const users = await userQueryBuilder.skip(skip).take(take).getMany();

    // Truy vấn tất cả payment trong khoảng năm
    const paymentQueryBuilder = this.membershipPaymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('user.branch', 'branch')
      .where('payment.year BETWEEN :startYear AND :endYear', {
        startYear,
        endYear,
      });

    if (branchId) {
      paymentQueryBuilder.andWhere('branch.id = :branchId', {
        branchId,
      });
    }
    if (userId) {
      paymentQueryBuilder.andWhere('payment.user_id = :userId', { userId });
    }

    const payments = await paymentQueryBuilder.getMany();

    // Xây dựng báo cáo
    const years = Array.from(
      { length: endYear! - startYear! + 1 },
      (_, i) => startYear! + i,
    );
    const paymentMap = new Map<string, Set<number>>();

    payments.forEach((payment) => {
      const userId = payment.user_id;
      if (!paymentMap.has(userId)) {
        paymentMap.set(userId, new Set());
      }
      paymentMap.get(userId)!.add(payment.year);
    });

    const reportDtos = users.map((user) => {
      const userPayments = years.map((year) => ({
        year,
        status: paymentMap.get(user.id)?.has(year) ? 1 : 0,
      }));
      return new MembershipPaymentReportDto(new UserDto(user), userPayments);
    });

    const pageMetaDto = new PageMetaDto({
      itemCount: totalUsers,
      pageOptionsDto: reportOptionsDto,
    });
    return new PageDto(reportDtos, pageMetaDto);
  }
}
