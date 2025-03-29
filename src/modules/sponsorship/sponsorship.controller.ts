// src/modules/sponsorships/sponsorship.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PageDto } from '../../common/dto/page.dto';
import { RoleType } from '../../constants/role-type';
import { AuthUser } from '../../decorators/auth-user.decorator';
import { Auth, UUIDParam } from '../../decorators/http.decorators';
import { UserEntity } from '../user/user.entity';
import { CreateSponsorshipDto } from './dtos/create-sponsorship.dto';
import { SponsorshipDto } from './dtos/sponsorship.dto';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipsPageOptionsDto } from './dtos/sponsorships-page-options.dto';
import { SponsorsByTierDto } from './dtos/sponsors-by-tier.dto';
import { SponsorRankingPaginationDto } from './dtos/sponsor-ranking-pagination.dto';
import { SponsorRankingDto } from './dtos/sponsor-ranking.dto';
import { Reference } from 'types';
import { ApiFile } from 'decorators/swagger.schema';
import { UpdateSponsorshipDto } from './dtos/update-sponsorship.dto';

@ApiTags('Sponsorships')
@Controller('sponsorships')
export class SponsorshipController {
  constructor(private readonly sponsorshipService: SponsorshipService) {}

  @Post()
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Thêm tài trợ cho sự kiện' })
  @ApiBody({ type: CreateSponsorshipDto })
  @ApiFile({ name: 'logo' })
  @ApiResponse({ status: 201, description: 'Tài trợ đã được thêm', type: SponsorshipDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async createSponsorship(
    @AuthUser() user: UserEntity,
    @Body() data: CreateSponsorshipDto,
    @UploadedFile() file?: Reference<Express.Multer.File>,
  ): Promise<SponsorshipDto> {
    return this.sponsorshipService.createSponsorship(data, user, file);
  }
  @Patch(':id')
  @Auth([RoleType.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cập nhật thông tin tài trợ' })
  @ApiParam({ name: 'id', type: String, description: 'ID tài trợ (UUID)' })
  @ApiBody({ type: UpdateSponsorshipDto })
  @ApiFile({ name: 'logo' })
  @ApiResponse({ status: 200, description: 'Tài trợ đã được cập nhật', type: SponsorshipDto })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài trợ' })
  async updateSponsorship(
    @UUIDParam('id') id: Uuid,
    @Body() data: UpdateSponsorshipDto,
    @UploadedFile() file?: Reference<Express.Multer.File>,
  ): Promise<SponsorshipDto> {
    return this.sponsorshipService.updateSponsorship(id, data, file);
  }
  @Get('sponsor-ranking')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({
    summary: 'Tổng hợp và xếp hạng nhà tài trợ của tất cả sự kiện (phân trang)',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhà tài trợ với tổng số tiền và số sự kiện',
    type: () => PageDto,
    example: {
      data: [
        {
          sponsorId: '8b434498-a143-42b2-854a-2b76548e29d3',
          sponsorName: 'Hồ Trung Nguyên 4',
          totalAmount: '100000.00',
          eventCount: 1,
        },
      ],
      meta: {
        page: 1,
        take: 10,
        itemCount: 2,
        pageCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  })
  async getSponsorRanking(
    @Query() dto: SponsorRankingPaginationDto,
  ): Promise<PageDto<SponsorRankingDto>> {
    return this.sponsorshipService.getSponsorRanking(dto);
  }

  @Get()
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Lấy danh sách tài trợ' })
  @ApiResponse({ status: 200, description: 'Danh sách tài trợ', type: PageDto })
  async getAllSponsorships(
    @Query() pageOptionsDto: SponsorshipsPageOptionsDto,
  ): Promise<PageDto<SponsorshipDto>> {
    return this.sponsorshipService.getAllSponsorships(pageOptionsDto);
  }

  @Get(':id')
  @Auth([RoleType.USER, RoleType.ADMIN])
  @ApiOperation({ summary: 'Lấy thông tin tài trợ theo ID' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID tài trợ (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin tài trợ',
    type: SponsorshipDto,
  })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài trợ' })
  async getSponsorshipById(@Param('id') id: Uuid): Promise<SponsorshipDto> {
    return this.sponsorshipService.getSponsorshipById(id);
  }

  @Delete(':id')
  @Auth([RoleType.ADMIN])
  @ApiOperation({ summary: 'Xóa tài trợ' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID tài trợ (UUID)',
    required: true,
  })
  @ApiResponse({ status: 204, description: 'Tài trợ đã được xóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tài trợ' })
  async deleteSponsorship(@Param('id') id: Uuid): Promise<void> {
    return this.sponsorshipService.deleteSponsorship(id);
  }

  @Get('event/:eventId/sponsors-by-tier')
  @ApiOperation({
    summary: 'Lấy danh sách nhà tài trợ theo hạng tài trợ của sự kiện',
  })
  @ApiParam({
    name: 'eventId',
    type: String,
    description: 'ID sự kiện (UUID)',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách nhà tài trợ theo hạng',
    type: [SponsorsByTierDto],
  })
  async getSponsorsByTier(
    @Param('eventId') eventId: Uuid,
  ): Promise<SponsorsByTierDto[]> {
    return this.sponsorshipService.getSponsorsByTier(eventId);
  }
}
