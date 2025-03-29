// src/modules/finance-report/finance-report.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FinanceReportFilterDto } from 'modules/finance/dtos/finance-report-filter.dto';
import { FinanceReportDto } from 'modules/finance/dtos/finance-report.dto';
import { FinanceReportService } from 'modules/finance/finance-report.service';

@Controller('finance-reports')
export class FinanceReportController {
  constructor(private readonly financeReportService: FinanceReportService) {}

  @Get()
  @ApiOperation({ summary: 'Tạo báo cáo tài chính tổng hợp' })
  @ApiResponse({
    status: 200,
    description: 'Báo cáo tài chính tổng hợp',
    type: FinanceReportDto,
  })
  async generateFinanceReport(@Query() filters: FinanceReportFilterDto) {
    return this.financeReportService.generateFinanceReport(filters);
  }
}
