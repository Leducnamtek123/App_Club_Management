// src/modules/events/events.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth } from '../../decorators/http.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { EventDto } from './dtos/event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { EventsService } from './event.service';
import { EventsPageOptionsDto } from './dtos/events-page-options.dto';
import { EventStatus } from '../../constants/enum/event-status.enum';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Tạo sự kiện mới' })
  @ApiConsumes('multipart/form-data') // Định nghĩa loại dữ liệu là multipart/form-data
  @ApiBody({
    description: 'Dữ liệu tạo sự kiện và upload ảnh',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Tiêu đề sự kiện' },
        description: { type: 'string', description: 'Mô tả sự kiện (HTML)' },
        eventDate: {
          type: 'string',
          format: 'date-time',
          description: 'Ngày diễn ra',
        },
        ticketClosingDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Ngày kết thúc bán vé',
        },
        location: { type: 'string', description: 'Địa điểm' },
        branchId: {
          type: 'string',
          nullable: true,
          description: 'ID chi nhánh',
        },
        status: {
          type: 'string',
          enum: Object.values(EventStatus),
          description: 'Trạng thái',
        },
        ticketPrice: {
          type: 'number',
          nullable: true,
          description: 'Giá vé (0 = miễn phí)',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, // Định nghĩa upload file
          description: 'Danh sách ảnh (tối đa 10)',
        },
      },
      required: ['title', 'description', 'eventDate', 'location'], // Các trường bắt buộc
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Sự kiện đã được tạo',
    type: EventDto,
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createEvent(
    @AuthUser() user: UserEntity,
    @Body() data: CreateEventDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<EventDto> {
    return this.eventsService.createEvent(data, user, images);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách sự kiện' })
  @ApiResponse({ status: 200, description: 'Danh sách sự kiện', type: PageDto })
  async getAllEvents(
    @Query() pageOptionsDto: EventsPageOptionsDto,
  ): Promise<PageDto<EventDto>> {
    return this.eventsService.getAllEvents(pageOptionsDto);
  }

  @Get(':id')
//   @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Lấy thông tin sự kiện theo ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID sự kiện (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin sự kiện',
    type: EventDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
  async getEventById(@Param('id') id: Uuid): Promise<EventDto> {
    return this.eventsService.getEventById(id);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Cập nhật sự kiện' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID sự kiện (UUID)',
    required: true,
  })
  @ApiConsumes('multipart/form-data') 
  @ApiBody({
    description: 'Dữ liệu cập nhật sự kiện và upload ảnh',
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Tiêu đề sự kiện',
          nullable: true,
        },
        description: {
          type: 'string',
          description: 'Mô tả sự kiện (HTML)',
          nullable: true,
        },
        eventDate: {
          type: 'string',
          format: 'date-time',
          description: 'Ngày diễn ra',
          nullable: true,
        },
        ticketClosingDate: {
          type: 'string',
          format: 'date-time',
          nullable: true,
          description: 'Ngày kết thúc bán vé',
        },
        location: { type: 'string', description: 'Địa điểm', nullable: true },
        branchId: {
          type: 'string',
          nullable: true,
          description: 'ID chi nhánh',
        },
        status: {
          type: 'string',
          enum: Object.values(EventStatus),
          description: 'Trạng thái',
          nullable: true,
        },
        ticketPrice: {
          type: 'number',
          nullable: true,
          description: 'Giá vé (0 = miễn phí)',
        },
        images: {
          type: 'array',
          items: { type: 'string', format: 'binary' }, 
          description: 'Danh sách ảnh mới (tối đa 10)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Sự kiện đã được cập nhật',
    type: EventDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
  async updateEvent(
    @Param('id') id: Uuid,
    @Body() data: UpdateEventDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<EventDto> {
    return this.eventsService.updateEvent(id, data, images);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Xóa sự kiện' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID sự kiện (UUID)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Sự kiện đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy sự kiện' })
  async deleteEvent(@Param('id') id: Uuid): Promise<void> {
    return this.eventsService.deleteEvent(id);
  }
}
