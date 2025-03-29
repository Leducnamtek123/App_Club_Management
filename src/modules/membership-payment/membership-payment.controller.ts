// src/modules/membership-payment/membership-payment.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MembershipPaymentService } from './membership-payment.service';
import { CreateMembershipPaymentDto } from 'modules/membership-payment/dtos/create-membership-payment.dto';
import { MembershipPaymentDto } from 'modules/membership-payment/dtos/membership-payment.dto';
import { PageDto } from '../../common/dto/page.dto';
import { MembershipPaymentsPageOptionsDto } from './dtos/membership-payments-page-options.dto';
import { MembershipPaymentReportOptionsDto } from './dtos/membership-payment-report-options.dto';
import { MembershipPaymentReportDto } from './dtos/membership-payment-report.dto';

@Controller('membership-payments')
export class MembershipPaymentController {
  constructor(
    private readonly membershipPaymentService: MembershipPaymentService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Ghi nhận phí hội viên mới' })
  @ApiResponse({
    status: 201,
    description: 'Phí hội viên đã được ghi nhận',
    type: MembershipPaymentDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ, đã đóng phí, hoặc năm chưa có mức phí',
  })
  async createMembershipPayment(@Body() data: CreateMembershipPaymentDto) {
    return this.membershipPaymentService.createMembershipPayment(data);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tất cả phí hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách phí hội viên với phân trang',
    type: PageDto,
  })
  async getAllMembershipPayments(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: MembershipPaymentsPageOptionsDto,
  ) {
    return this.membershipPaymentService.getMembershipPayments(pageOptionsDto);
  }

  @Get(':user_id/:year')
  @ApiOperation({ summary: 'Lấy phí hội viên theo user và năm' })
  @ApiResponse({
    status: 200,
    description: 'Phí hội viên theo user và năm',
    type: MembershipPaymentDto,
  })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  async getMembershipPaymentByUserAndYear(
    @Param('user_id') user_id: string,
    @Param('year') year: number,
  ) {
    return this.membershipPaymentService.getMembershipPaymentByUserAndYear(
      user_id,
      year,
    );
  }

  @Delete(':user_id/:year')
  @ApiOperation({ summary: 'Xóa phí hội viên theo user và năm' })
  @ApiResponse({ status: 204, description: 'Phí hội viên đã được xóa' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  async deleteMembershipPayment(
    @Param('user_id') user_id: string,
    @Param('year') year: number,
  ) {
    return this.membershipPaymentService.deleteMembershipPayment(user_id, year);
  }

  @Get('report')
  @ApiOperation({ summary: 'Báo cáo tình hình đóng hội phí của hội viên' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách báo cáo tình hình đóng phí với phân trang',
    type: PageDto,
  })
  async getMembershipPaymentReport(
    @Query(new ValidationPipe({ transform: true }))
    reportOptionsDto: MembershipPaymentReportOptionsDto,
  ): Promise<PageDto<MembershipPaymentReportDto>> {
    return this.membershipPaymentService.getMembershipPaymentReport(
      reportOptionsDto,
    );
  }
}
