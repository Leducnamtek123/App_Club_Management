// src/modules/membership-fee/membership-fee.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MembershipFeeService } from './membership-fee.service';
import { MembershipFeeDto } from 'modules/membership-fee/dtos/membership-fee.dto';
import { CreateMembershipFeeDto } from 'modules/membership-fee/dtos/create-membership-fee.dto';
import { UpdateMembershipFeeDto } from './dtos/update-membership-fee.dto';

@Controller('membership-fees')
export class MembershipFeeController {
  constructor(private readonly membershipFeeService: MembershipFeeService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo phí hội viên cho một năm' })
  @ApiResponse({
    status: 201,
    description: 'Phí hội viên đã được tạo',
    type: CreateMembershipFeeDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc năm đã tồn tại',
  })
  async createMembershipFee(@Body() data: CreateMembershipFeeDto) {
    return this.membershipFeeService.createMembershipFee(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách phí hội viên qua các năm' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phí hội viên',
    type: [MembershipFeeDto],
  })
  async getAllMembershipFees() {
    return this.membershipFeeService.getAllMembershipFees();
  }

  @Get(':year')
  @ApiOperation({ summary: 'Lấy phí hội viên theo năm' })
  @ApiResponse({
    status: 200,
    description: 'Phí hội viên theo năm',
    type: MembershipFeeDto,
  })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  async getMembershipFeeByYear(@Param('year') year: number) {
    return this.membershipFeeService.getMembershipFeeByYear(year);
  }

  @Put(':year')
  @ApiOperation({ summary: 'Cập nhật phí hội viên theo năm' })
  @ApiResponse({
    status: 200,
    description: 'Phí hội viên đã được cập nhật',
    type: MembershipFeeDto,
  })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  async updateMembershipFee(
    @Param('year') year: number,
    @Body() data: UpdateMembershipFeeDto,
  ) {
    return this.membershipFeeService.updateMembershipFee(year, data);
  }

  @Delete(':year')
  @ApiOperation({ summary: 'Xóa phí hội viên theo năm' })
  @ApiResponse({ status: 204, description: 'Phí hội viên đã được xóa' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  async deleteMembershipFee(@Param('year') year: number) {
    return this.membershipFeeService.deleteMembershipFee(year);
  }
}
