// src/modules/finance/transaction.controller.ts
import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PageDto } from '../../common/dto/page.dto';
import { TransactionService } from 'modules/transaction/transaction.service';
import { CreateTransactionDto } from 'modules/transaction/dtos/create-transaction.dto';
import { TransactionDto } from 'modules/transaction/dtos/transaction.dto';
import { TransactionsPageOptionsDto } from 'modules/transaction/dtos/transactions-page-options.dto';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { UserEntity } from 'modules/user/user.entity';
import { RoleType } from 'constants/role-type';
import { Auth } from '../../decorators/http.decorators';
import { UpdateTransactionDto } from 'modules/transaction/dtos/update-transaction.dto';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly financeService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo giao dịch mới' })
  @ApiResponse({
    status: 201,
    description: 'Giao dịch đã được tạo',
    type: TransactionDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Auth([RoleType.USER, RoleType.ADMIN])
  async createTransaction(
    @AuthUser() user: UserEntity,
    @Body() data: CreateTransactionDto,
  ) {
    console.log('user', user);
    return this.financeService.createTransaction(data, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách giao dịch' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách giao dịch',
    type: PageDto,
  })
  async getAllTransactions(
    @Query() pageOptionsDto: TransactionsPageOptionsDto,
  ) {
    return this.financeService.getAllTransactions(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Lấy thông tin giao dịch theo ID' })
  @ApiParam({
    name: 'id',
    type: String, 
    description: 'ID giao dịch (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin giao dịch',
    type: TransactionDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async getTransactionById(@Param('id') id: Uuid): Promise<TransactionDto> {
    return this.financeService.getTransactionById(id);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Cập nhật giao dịch' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID giao dịch (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Giao dịch đã được cập nhật',
    type: TransactionDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async updateTransaction(
    @Param('id') id: Uuid,
    @Body() data: UpdateTransactionDto,
  ): Promise<TransactionDto> {
    return this.financeService.updateTransaction(id, data);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Xóa giao dịch' })
  @ApiParam({
    name: 'id',
    type: String, // Swagger không hỗ trợ trực tiếp Uuid, dùng String
    description: 'ID giao dịch (UUID)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Giao dịch đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy giao dịch' })
  async deleteTransaction(@Param('id') id: Uuid): Promise<void> {
    return this.financeService.deleteTransaction(id);
  }
}
