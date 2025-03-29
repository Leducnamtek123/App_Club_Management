// src/modules/membership-fee/membership-fee.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipFeeEntity } from './membership-fee.entity';
import { MembershipFeeDto } from 'modules/membership-fee/dtos/membership-fee.dto';
import { CreateMembershipFeeDto } from 'modules/membership-fee/dtos/create-membership-fee.dto';
import { UpdateMembershipFeeDto } from './dtos/update-membership-fee.dto';

@Injectable()
export class MembershipFeeService {
  constructor(
    @InjectRepository(MembershipFeeEntity)
    private readonly membershipFeeRepo: Repository<MembershipFeeEntity>,
  ) {}

  async createMembershipFee(
    data: CreateMembershipFeeDto,
  ): Promise<CreateMembershipFeeDto> {
    const existingFee = await this.membershipFeeRepo.findOne({
      where: { year: data.year },
    });
    if (existingFee) {
      throw new BadRequestException(
        `Phí hội viên cho năm ${data.year} đã tồn tại`,
      );
    }
    const fee = this.membershipFeeRepo.create(data);
    const savedFee = await this.membershipFeeRepo.save(fee);
    return savedFee.toDto();
  }

  async getAllMembershipFees(): Promise<MembershipFeeDto[]> {
    const fees = await this.membershipFeeRepo.find();
    return fees.toDtos();
  }

  async getMembershipFeeByYear(year: number): Promise<MembershipFeeDto> {
    const fee = await this.membershipFeeRepo.findOne({ where: { year } });
    if (!fee) {
      throw new BadRequestException(
        `Không tìm thấy phí hội viên cho năm ${year}`,
      );
    }
    return fee.toDto();
  }

  async updateMembershipFee(
    year: number,
    data: UpdateMembershipFeeDto,
  ): Promise<MembershipFeeDto> {
    const fee = await this.membershipFeeRepo.findOne({ where: { year } });
    if (!fee) {
      throw new BadRequestException(
        `Không tìm thấy phí hội viên cho năm ${year}`,
      );
    }
    await this.membershipFeeRepo.update({ year }, data);
    const updatedFee = await this.membershipFeeRepo.findOne({
      where: { year },
    });
    return updatedFee!.toDto();
  }

  async deleteMembershipFee(year: number): Promise<void> {
    const fee = await this.membershipFeeRepo.findOne({ where: { year } });
    if (!fee) {
      throw new BadRequestException(
        `Không tìm thấy phí hội viên cho năm ${year}`,
      );
    }
    await this.membershipFeeRepo.delete({ year });
  }
}
