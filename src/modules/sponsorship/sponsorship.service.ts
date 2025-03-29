// src/modules/sponsorships/sponsorship.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SponsorshipEntity } from './sponsorship.entity';
import { CreateSponsorshipDto } from './dtos/create-sponsorship.dto';
import { PageDto } from '../../common/dto/page.dto';
import { EventEntity } from '../event/event.entity';
import { SponsorshipTierEntity } from '../sponsorship-tier/sponsorship-tier.entity';
import { UserEntity } from '../user/user.entity';
import { SponsorshipDto } from './dtos/sponsorship.dto';
import { TransactionType } from '../../constants/enum/transaction-type.enum';
import { SponsorshipsPageOptionsDto } from './dtos/sponsorships-page-options.dto';
import { SponsorshipTier } from '../../constants/enum/sponsorship-tier.enum';
import { SponsorsByTierDto } from './dtos/sponsors-by-tier.dto';
import { PageMetaDto } from '../../common/dto/page-meta.dto';
import { SponsorRankingPaginationDto } from './dtos/sponsor-ranking-pagination.dto';
import { SponsorRankingDto } from './dtos/sponsor-ranking.dto';
import { ValidatorService } from '../../shared/services/validator.service';
import { Reference } from '../../types';
import { FileNotImageException } from 'exceptions/file-not-image.exception';
import { IStorageService } from 'interfaces/IStorageService';
import { UpdateSponsorshipDto } from './dtos/update-sponsorship.dto';

@Injectable()
export class SponsorshipService {
    constructor(
        @InjectRepository(SponsorshipEntity)
        private readonly sponsorshipRepo: Repository<SponsorshipEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(EventEntity)
        private readonly eventRepo: Repository<EventEntity>,
        @InjectRepository(SponsorshipTierEntity)
        private readonly tierRepo: Repository<SponsorshipTierEntity>,
        private validatorService: ValidatorService,
        @Inject('IStorageService')
        private readonly storageService: IStorageService,
    ) { }

    async createSponsorship(
        dto: CreateSponsorshipDto,
        user: UserEntity,
        file?: Reference<Express.Multer.File>,
    ): Promise<SponsorshipDto> {
        const sponsor = await this.userRepo.findOne({
            where: { id: dto.sponsorId },
        });
        if (!sponsor) {
            throw new NotFoundException(
                `Không tìm thấy hội viên với ID ${dto.sponsorId}`,
            );
        }

        const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
        if (!event) {
            throw new NotFoundException(
                `Không tìm thấy sự kiện với ID ${dto.eventId}`,
            );
        }

        const tier = await this.tierRepo
            .createQueryBuilder('tier')
            .where('tier.event_id = :eventId', { eventId: dto.eventId })
            .andWhere('tier.minAmount <= :amount', { amount: dto.amount })
            .orderBy('tier.minAmount', 'DESC')
            .getOne();

        const sponsorshipData = {
            sponsor,
            event,
            amount: dto.amount,
            note: dto.note,
            tier: tier || undefined,
            type: TransactionType.INCOME,
            createdBy: user,
        };

        const sponsorship = this.sponsorshipRepo.create(sponsorshipData);

        if (file && !this.validatorService.isImage(file.mimetype)) {
            throw new FileNotImageException();
        }
        if (file) {
            sponsorship.logo = await this.storageService.uploadFile(file, `events/${dto.sponsorId}/images`);
        }

        const savedSponsorship = await this.sponsorshipRepo.save(sponsorship);
        return savedSponsorship.toDto();
    }
    async updateSponsorship(
        id: Uuid,
        dto: UpdateSponsorshipDto,
        file?: Reference<Express.Multer.File>,
      ): Promise<SponsorshipDto> {
        const sponsorship = await this.sponsorshipRepo.findOne({
          where: { id },
          relations: ['sponsor', 'event', 'tier', 'createdBy'],
        });
        if (!sponsorship) {
          throw new NotFoundException(`Không tìm thấy tài trợ với ID ${id}`);
        }
    
        // Cập nhật sponsor nếu có sponsorId mới
        if (dto.sponsorId) {
          const sponsor = await this.userRepo.findOne({
            where: { id: dto.sponsorId },
          });
          if (!sponsor) {
            throw new NotFoundException(
              `Không tìm thấy hội viên với ID ${dto.sponsorId}`,
            );
          }
          sponsorship.sponsor = sponsor;
        }
    
        // Cập nhật event nếu có eventId mới
        if (dto.eventId) {
          const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
          if (!event) {
            throw new NotFoundException(
              `Không tìm thấy sự kiện với ID ${dto.eventId}`,
            );
          }
          sponsorship.event = event;
        }
    
        // Cập nhật amount và tier nếu có amount mới
        if (dto.amount !== undefined) {
          const tier = await this.tierRepo
            .createQueryBuilder('tier')
            .where('tier.event_id = :eventId', { eventId: sponsorship.event.id })
            .andWhere('tier.minAmount <= :amount', { amount: dto.amount })
            .orderBy('tier.minAmount', 'DESC')
            .getOne();
          sponsorship.amount = dto.amount;
          sponsorship.tier = tier || undefined;
        }
    
        // Cập nhật note nếu có
        if (dto.note !== undefined) {
          sponsorship.note = dto.note;
        }
    
        // Xử lý file ảnh (nếu có)
        if (file && !this.validatorService.isImage(file.mimetype)) {
          throw new FileNotImageException();
        }
        if (file) {
          sponsorship.logo = await this.storageService.uploadFile(file, `events/${sponsorship.sponsor.id}/images`);
        }
    
        const updatedSponsorship = await this.sponsorshipRepo.save(sponsorship);
        return updatedSponsorship.toDto();
      }
    async getAllSponsorships(
        pageOptionsDto: SponsorshipsPageOptionsDto,
    ): Promise<PageDto<SponsorshipDto>> {
        const queryBuilder = this.sponsorshipRepo
            .createQueryBuilder('sponsorship')
            .leftJoinAndSelect('sponsorship.sponsor', 'sponsor')
            .leftJoinAndSelect('sponsorship.event', 'event')
            .leftJoinAndSelect('sponsorship.tier', 'tier')
            .leftJoinAndSelect('sponsorship.createdBy', 'createdBy')

        if (pageOptionsDto.sponsorId) {
            queryBuilder.andWhere('sponsor.id = :sponsorId', {
                sponsorId: pageOptionsDto.sponsorId,
            });
        }

        if (pageOptionsDto.eventId) {
            queryBuilder.andWhere('sponsorship.event_id = :eventId', {
                eventId: pageOptionsDto.eventId,
            });
        }

        if (pageOptionsDto.minAmount !== undefined) {
            queryBuilder.andWhere('sponsorship.amount >= :minAmount', {
                minAmount: pageOptionsDto.minAmount,
            });
        }

        if (pageOptionsDto.maxAmount !== undefined) {
            queryBuilder.andWhere('sponsorship.amount <= :maxAmount', {
                maxAmount: pageOptionsDto.maxAmount,
            });
        }

        queryBuilder.orderBy(
            'sponsorship.createdAt',
            pageOptionsDto.order || 'DESC',
        );

        const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
        return items.toPageDto(pageMetaDto);
    }

    async getSponsorshipById(id: Uuid): Promise<SponsorshipDto> {
        const sponsorship = await this.sponsorshipRepo.findOne({
            where: { id },
            relations: ['sponsor', 'event', 'tier', 'createdBy'],
        });

        if (!sponsorship) {
            throw new NotFoundException(`Không tìm thấy tài trợ với ID ${id}`);
        }

        return sponsorship.toDto();
    }

    async deleteSponsorship(id: Uuid): Promise<void> {
        const sponsorship = await this.sponsorshipRepo.findOne({ where: { id } });
        if (!sponsorship) {
            throw new NotFoundException(`Không tìm thấy tài trợ với ID ${id}`);
        }

        await this.sponsorshipRepo.delete(id);
    }

    async getSponsorsByTier(eventId: Uuid): Promise<SponsorsByTierDto[]> {
        const sponsorships = await this.sponsorshipRepo.find({
            where: { event: { id: eventId } },
            relations: ['sponsor', 'event', 'tier', 'createdBy'],
        });

        const tierMap = new Map<SponsorshipTier | null, SponsorshipDto[]>();

        sponsorships.forEach((sponsorship) => {
            // Kiểm tra xem sponsorship và các quan hệ có hợp lệ không
            if (!sponsorship || !sponsorship.event || !sponsorship.sponsor) {
                console.warn('Sponsorship không hợp lệ:', sponsorship);
                return; // Bỏ qua bản ghi không hợp lệ
            }

            const tierName = sponsorship.tier ? sponsorship.tier.name : null;
            if (!tierMap.has(tierName)) {
                tierMap.set(tierName, []);
            }
            try {
                tierMap.get(tierName)!.push(sponsorship.toDto());
            } catch (error) {
                console.error(
                    'Lỗi khi chuyển đổi sponsorship sang DTO:',
                    error,
                    sponsorship,
                );
            }
        });

        const result: SponsorsByTierDto[] = [];
        tierMap.forEach((sponsors, tier) => {
            result.push({ tier, sponsors });
        });

        return result;
    }

    async getSponsorRanking(
        dto: SponsorRankingPaginationDto,
    ): Promise<PageDto<SponsorRankingDto>> {
        const { page, take, branchId, eventId } = dto;

        // Query tổng hợp và xếp hạng nhà tài trợ
        const queryBuilder = this.sponsorshipRepo
            .createQueryBuilder('sponsorship')
            .select([
                'sponsor.id AS "sponsorId"',
                'sponsor.name AS "sponsorName"',
                'COALESCE(SUM(CAST(sponsorship.amount AS DECIMAL(15,2))), 0) AS "totalAmount"',
                'COUNT(DISTINCT event.id) AS "eventCount"',
            ])
            .leftJoin('sponsorship.sponsor', 'sponsor')
            .leftJoin('sponsorship.event', 'event')
            .groupBy('sponsor.id, sponsor.name')
            .orderBy('"totalAmount"', 'DESC');

        // Điều kiện lọc
        if (branchId) {
            queryBuilder.andWhere('event.branch_id = :branchId', { branchId });
        }

        if (eventId) {
            queryBuilder.andWhere('event.id = :eventId', { eventId });
        }

        // Debug query
        console.log('Generated SQL:', queryBuilder.getSql());

        // Tính tổng số nhà tài trợ
        const totalQuery = queryBuilder.clone();
        const itemCount = await totalQuery.getCount();

        // Áp dụng phân trang
        const sponsors = await queryBuilder
            .offset((page - 1) * take)
            .limit(take)
            .getRawMany();

        // Debug dữ liệu thô
        console.log('Raw sponsors:', sponsors);

        // Chuyển đổi dữ liệu thành DTO, xử lý giá trị không hợp lệ
        const sponsorRankings: SponsorRankingDto[] = sponsors.map((s) => {
            const totalAmount = s.totalAmount ? parseFloat(s.totalAmount) : 0;
            const eventCount = s.eventCount ? parseInt(s.eventCount, 10) : 0;

            return {
                sponsorId: s.sponsorId || 'N/A',
                sponsorName: s.sponsorName || 'Unknown',
                totalAmount: isNaN(totalAmount) ? '0.00' : totalAmount.toFixed(2),
                eventCount: isNaN(eventCount) ? 0 : eventCount,
            };
        });

        // Tạo metadata phân trang
        const pageMeta = new PageMetaDto({ pageOptionsDto: dto, itemCount });

        return new PageDto(sponsorRankings, pageMeta);
    }
}
