import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationService as ZaloNotificationService } from './zalo-notification.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationDto as ZaloNotificationDto } from './dtos/zalo-notification.dto';
import { PageOptionsDto } from '../../common/dto/page-options.dto';
import { PageDto } from '../../common/dto/page.dto';

@ApiTags('ZaloNotifications')
@Controller('zalo notifications')
export class ZaloNotificationController {
  constructor(private zaloNotificationService: ZaloNotificationService) {}

  @Post('broadcast')
  @ApiOperation({ summary: 'Gửi thông báo hàng loạt' })
  @ApiResponse({ status: 201, type: ZaloNotificationDto })
  async broadcast(@Body('message') message: string) {
    const notification = await this.zaloNotificationService.broadcast(message);
    return { message: 'Broadcast queued', data: notification };
  }

  @Post('remind-fee')
  @ApiOperation({ summary: 'Gửi thông báo nhắc phí cho những người được chọn' })
  @ApiResponse({ status: 201, type: ZaloNotificationDto })
  async remindFee(@Body('userIds') userIds: string[]) {
    const notification = await this.zaloNotificationService.remindFee(userIds);
    return { message: 'Fee reminders queued', data: notification };
  }

  @Post('remind-birthday')
  @ApiOperation({ summary: 'Gửi thông báo chúc mừng sinh nhật thủ công' })
  @ApiResponse({ status: 201, type: ZaloNotificationDto })
  async remindBirthday() {
    const notification = await this.zaloNotificationService.remindBirthday();
    return { message: 'Birthday reminders queued', data: notification };
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách thông báo' })
  @ApiResponse({ status: 200, type: PageDto<ZaloNotificationDto> })
  async getNotifications(
    @Query(new ValidationPipe({ transform: true }))
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<ZaloNotificationDto>> {
    return this.zaloNotificationService.getNotifications(pageOptionsDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết thông báo' })
  @ApiResponse({ status: 200, type: ZaloNotificationDto })
  async getNotification(@Param('id') id: Uuid) {
    return this.zaloNotificationService.getNotification(id);
  }
}
