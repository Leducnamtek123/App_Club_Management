import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query, ValidationPipe } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { TicketDto } from './dtos/ticket.dto';
import { Auth, UUIDParam } from 'decorators/http.decorators';
import { RoleType } from 'constants/role-type';
import { PageDto } from 'common/dto/page.dto';
import { TicketsPageOptionsDto } from './dtos/tickets-page-options.dto';


@ApiTags('Tickets')
@Controller('tickets')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tham gia sự kiện' })
  @ApiResponse({ status: 201, type: TicketDto })
  async registerForEvent(
    @Body('userId') userId: Uuid,
    @Body('eventId') eventId: Uuid,
  ) {
    return this.ticketService.registerForEvent(userId, eventId);
  }

  @Post(':id/confirm-payment')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác nhận thanh toán vé' })
  @ApiResponse({ status: 200, type: TicketDto })
  @ApiParam({ name: 'id', type: String, description: 'Ticket ID (UUID)', example: '550e8400-e29b-41d4-a716-446655440000' })
  async confirmPayment(
    @UUIDParam('id') ticketId: Uuid,
  ) {
    return this.ticketService.confirmPayment(ticketId);
  }
  @Get('user/:userId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy tất cả vé của một hội viên' })
  @ApiParam({ name: 'userId', type: String, description: 'User ID (UUID)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Danh sách vé của hội viên',
    type: PageDto,
  })
  async getTicketsByUser(
    @UUIDParam('userId') userId: Uuid,
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: TicketsPageOptionsDto,
  ): Promise<PageDto<TicketDto>> {
    return this.ticketService.getTicketsByUser(userId, pageOptionsDto);
  }
}
