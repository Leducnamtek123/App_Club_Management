// src/modules/sponsorship-tiers/sponsorship-tier.controller.ts
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { SponsorshipTierService } from './sponsorship-tier.service';
import { CreateSponsorshipTierDto } from './dtos/create-sponsorship-tier.dto';
import { SponsorshipTierDto } from './dtos/sponsorship-tier.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { RoleType } from '../../constants/role-type';
import { Auth } from '../../decorators/http.decorators';
import { UpdateSponsorshipTierDto } from './dtos/update-sponsorship-tier.dto';

@ApiTags('Sponsorship Tiers')
@Controller('sponsorship-tiers')
export class SponsorshipTierController {
  constructor(private readonly tierService: SponsorshipTierService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Thêm mức tài trợ cho sự kiện' })
  @ApiBody({ type: CreateSponsorshipTierDto })
  @ApiResponse({
    status: 201,
    description: 'Mức tài trợ đã được thêm',
    type: SponsorshipTierDto,
  })
  async createSponsorshipTier(
    @Body() data: CreateSponsorshipTierDto,
  ): Promise<SponsorshipTierDto> {
    return this.tierService.createSponsorshipTier(data);
  }

  @Get('event/:eventId')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Lấy danh sách mức tài trợ của sự kiện' })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'ID sự kiện (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách mức tài trợ',
    type: [SponsorshipTierDto],
  })
  async getTiersByEvent(
    @Param('eventId') eventId: Uuid,
  ): Promise<SponsorshipTierDto[]> {
    return this.tierService.getTiersByEvent(eventId);
  }

  @Put(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Cập nhật mức tài trợ và xếp hạng lại nhà tài trợ' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID mức tài trợ (UUID)',
    required: true,
  })
  @ApiBody({ type: UpdateSponsorshipTierDto })
  @ApiResponse({
    status: 200,
    description: 'Mức tài trợ đã được cập nhật',
    type: SponsorshipTierDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mức tài trợ' })
  async updateSponsorshipTier(
    @Param('id') id: Uuid,
    @Body() data: UpdateSponsorshipTierDto,
  ): Promise<SponsorshipTierDto> {
    return this.tierService.updateSponsorshipTier(id, data);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Xóa mức tài trợ và xếp hạng lại nhà tài trợ' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID mức tài trợ (UUID)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Mức tài trợ đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy mức tài trợ' })
  async deleteSponsorshipTier(@Param('id') id: Uuid): Promise<void> {
    return this.tierService.deleteSponsorshipTier(id);
  }
}
