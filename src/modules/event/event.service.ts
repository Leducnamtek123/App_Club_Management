// src/modules/events/events.service.ts
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './event.entity';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { PageDto } from '../../common/dto/page.dto';
import { EventStatus } from '../../constants/enum/event-status.enum';
import { UserEntity } from '../user/user.entity';
import { EventDto } from './dtos/event.dto';
import { IStorageService } from '../../interfaces/IStorageService';
import { EventsPageOptionsDto } from './dtos/events-page-options.dto';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(EventEntity)
        private readonly eventRepo: Repository<EventEntity>,
        @Inject('IStorageService')
        private readonly storageService: IStorageService,
    ) { }

    async createEvent(
        dto: CreateEventDto,
        user: UserEntity,
        images?: Express.Multer.File[],
    ): Promise<EventDto> {
        let imageUrls: string[] | undefined;
        if (images && images.length > 0) {
            imageUrls = await Promise.all(
                images.map((file) =>
                    this.storageService.uploadFile(file, `events/${dto.title}/images`),
                ),
            );
        }

        const eventData = {
            title: dto.title,
            description: dto.description,
            startDate: new Date(dto.startDate),
            endDate: dto.endDate,
            ticketClosingDate: dto.ticketClosingDate
                ? new Date(dto.ticketClosingDate)
                : undefined,
            location: dto.location,
            branch: dto.branchId ? ({ id: dto.branchId } as any) : undefined,
            branch_id: dto.branchId,
            status: dto.status || EventStatus.UPCOMING,
            ticketPrice: dto.ticketPrice || 0,
            images: imageUrls,
            createdBy: user,
            created_by_id: user.id,
        };

        const event = this.eventRepo.create(eventData);
        const savedEvent = await this.eventRepo.save(event);
        return savedEvent.toDto();
    }

    async getAllEvents(
        pageOptionsDto: EventsPageOptionsDto,
    ): Promise<PageDto<EventDto>> {
        const queryBuilder = this.eventRepo
            .createQueryBuilder('event')
            .leftJoinAndSelect('event.branch', 'branch')
            .leftJoinAndSelect('event.createdBy', 'createdBy');

        // Lọc theo tiêu đề
        if (pageOptionsDto.title) {
            queryBuilder.andWhere('event.title ILIKE :title', {
                title: `%${pageOptionsDto.title}%`,
            });
        }

        // Lọc theo trạng thái
        if (pageOptionsDto.status) {
            queryBuilder.andWhere('event.status = :status', {
                status: pageOptionsDto.status,
            });
        }

        // Lọc theo branch
        if (pageOptionsDto.branchId) {
            queryBuilder.andWhere('event.branch_id = :branchId', {
                branchId: pageOptionsDto.branchId,
            });
        }

        // Lọc theo miễn phí/có phí
        if (pageOptionsDto.isFree !== undefined) {
            if (pageOptionsDto.isFree) {
                queryBuilder.andWhere('event.ticketPrice = 0');
            } else {
                queryBuilder.andWhere('event.ticketPrice > 0');
            }
        }

        // Lọc theo khoảng thời gian
        if (pageOptionsDto.startDate || pageOptionsDto.endDate) {
            queryBuilder.andWhere('event.eventDate BETWEEN :startDate AND :endDate', {
                startDate: pageOptionsDto.startDate || new Date(0),
                endDate: pageOptionsDto.endDate || new Date(),
            });
        }


        // Áp dụng phân trang
        const [items, pageMetaDto] = await queryBuilder.paginate(pageOptionsDto);
        return items.toPageDto(pageMetaDto);
    }

    async getEventById(id: Uuid): Promise<EventDto> {
        const event = await this.eventRepo.findOne({
            where: { id },
            relations: ['branch', 'createdBy'],
        });

        if (!event) {
            throw new NotFoundException(`Không tìm thấy sự kiện với ID ${id}`);
        }

        return event.toDto();
    }

    async updateEvent(
        id: Uuid,
        dto: UpdateEventDto,
        images?: Express.Multer.File[],
    ): Promise<EventDto> {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Không tìm thấy sự kiện với ID ${id}`);
        }

        let imageUrls = event.images;
        if (images && images.length > 0) {
            if (imageUrls && imageUrls.length > 0) {
                await Promise.all(
                    imageUrls.map((url) => this.storageService.deleteFile(url)),
                );
            }
            imageUrls = await Promise.all(
                images.map((file) =>
                    this.storageService.uploadFile(
                        file,
                        `events/${dto.title || event.title}/images`,
                    ),
                ),
            );
        }

        const updatedData: Partial<EventEntity> = {
            title: dto.title || event.title,
            description: dto.description || event.description,
            startDate: dto.startDate ? new Date(dto.startDate) : event.startDate,
            endDate: dto.endDate ? new Date(dto.startDate) : event.startDate,
            ticketClosingDate: dto.ticketClosingDate
                ? new Date(dto.ticketClosingDate)
                : event.ticketClosingDate,
            location: dto.location || event.location,
            branch: dto.branchId ? ({ id: dto.branchId } as any) : event.branch,
            branch_id: dto.branchId || event.branch_id,
            status: dto.status || event.status,
            ticketPrice:
                dto.ticketPrice !== undefined ? dto.ticketPrice : event.ticketPrice,
            images: imageUrls,
        };

        await this.eventRepo.update(id, updatedData);
        const updatedEvent = await this.eventRepo.findOne({
            where: { id },
            relations: ['branch', 'createdBy'],
        });

        return updatedEvent!.toDto();
    }

    async deleteEvent(id: Uuid): Promise<void> {
        const event = await this.eventRepo.findOne({ where: { id } });
        if (!event) {
            throw new NotFoundException(`Không tìm thấy sự kiện với ID ${id}`);
        }

        if (event.images && event.images.length > 0) {
            await Promise.all(
                event.images.map((url) => this.storageService.deleteFile(url)),
            );
        }

        await this.eventRepo.delete(id);
    }

  private updateEventStatus(event: EventEntity): EventStatus {
    const now = new Date();
    if (now < event.startDate!) {
      return EventStatus.UPCOMING;
    } else if (now >= event.startDate! && now <= event.endDate!) {
      return EventStatus.IN_PROGRESS;
    } else if (now > event.endDate!) {
      return EventStatus.FINISHED;
    }
    return event.status;
  }
  @Cron('0 0 * * *') // Chạy lúc 0:00 mỗi ngày
  async updateAllEventStatuses() {
    const events = await this.eventRepo.find();
    let updatedCount = 0;

    for (const event of events) {
      const newStatus = this.updateEventStatus(event);
      if (newStatus !== event.status) {
        event.status = newStatus;
        await this.eventRepo.save(event);
        updatedCount++;
      }
    }
  }
}
