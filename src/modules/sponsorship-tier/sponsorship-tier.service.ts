// src/modules/sponsorship-tiers/sponsorship-tier.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SponsorshipTierEntity } from './sponsorship-tier.entity';
import { CreateSponsorshipTierDto } from './dtos/create-sponsorship-tier.dto';
import { EventEntity } from '../event/event.entity';
import { SponsorshipTierDto } from './dtos/sponsorship-tier.dto';
import { SponsorshipEntity } from '../sponsorship/sponsorship.entity';
import { UpdateSponsorshipTierDto } from './dtos/update-sponsorship-tier.dto';

@Injectable()
export class SponsorshipTierService {
  constructor(
    @InjectRepository(SponsorshipTierEntity)
    private readonly tierRepo: Repository<SponsorshipTierEntity>,
    @InjectRepository(EventEntity)
    private readonly eventRepo: Repository<EventEntity>,
    @InjectRepository(SponsorshipEntity)
    private readonly sponsorshipRepo: Repository<SponsorshipEntity>,
  ) {}

  async createSponsorshipTier(
    dto: CreateSponsorshipTierDto,
  ): Promise<SponsorshipTierDto> {
    const event = await this.eventRepo.findOne({ where: { id: dto.eventId } });
    if (!event) {
      throw new NotFoundException(
        `Không tìm thấy sự kiện với ID ${dto.eventId}`,
      );
    }

    const existingTier = await this.tierRepo.findOne({
      where: { name: dto.name, event: { id: dto.eventId } },
    });
    if (existingTier) {
      throw new BadRequestException(
        `Mức tài trợ "${dto.name}" đã tồn tại cho sự kiện này`,
      );
    }

    const tierData = {
      name: dto.name,
      minAmount: dto.minAmount,
      event,
      event_id: dto.eventId,
    };

    const tier = this.tierRepo.create(tierData);
    const savedTier = await this.tierRepo.save(tier);

    await this.recalculateSponsorshipTiers(tier.event.id);
    return savedTier.toDto();
  }

  async getTiersByEvent(eventId: Uuid): Promise<SponsorshipTierDto[]> {
    const tiers = await this.tierRepo.find({
      where: { event: { id: eventId } },
      relations: ['event'],
    });
    return tiers.map((tier) => tier.toDto());
  }

  async updateSponsorshipTier(
    id: Uuid,
    dto: UpdateSponsorshipTierDto,
  ): Promise<SponsorshipTierDto> {
    // Tìm tier cần cập nhật
    const tier = await this.tierRepo.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!tier) {
      throw new NotFoundException(`Không tìm thấy mức tài trợ với ID ${id}`);
    }

    if (dto.name !== undefined) tier.name = dto.name;
    if (dto.minAmount !== undefined) tier.minAmount = dto.minAmount;

    const updatedTier = await this.tierRepo.save(tier);

    await this.recalculateSponsorshipTiers(tier.event.id);

    return updatedTier.toDto();
  }

  async deleteSponsorshipTier(id: Uuid): Promise<void> {
    const tier = await this.tierRepo.findOne({
      where: { id },
      relations: ['event'],
    });
    if (!tier) {
      throw new NotFoundException(`Không tìm thấy mức tài trợ với ID ${id}`);
    }

    await this.tierRepo.delete(id);

    await this.recalculateSponsorshipTiers(tier.event.id);
  }

  private async recalculateSponsorshipTiers(eventId: Uuid): Promise<void> {
    const tiers = await this.tierRepo.find({
      where: { event: { id: eventId } },
      order: { minAmount: 'DESC' },
    });

    if (tiers.length === 0) {
      await this.sponsorshipRepo
        .createQueryBuilder()
        .update(SponsorshipEntity)
        .set({ tier: null })
        .where('event_id = :eventId', { eventId })
        .execute();
      return;
    }

    const sponsorships = await this.sponsorshipRepo.find({
      where: { event: { id: eventId } },
      relations: ['tier'],
    });

    console.log('tiers', tiers);

    for (const sponsorship of sponsorships) {
      // Chuyển amount và minAmount thành số để so sánh
      const amount = parseFloat(sponsorship.amount.toString());
      const newTier =
        tiers.find((tier) => amount >= parseFloat(tier.minAmount.toString())) ||
        null;

      console.log('sponsorship.amount', amount);
      console.log('newTier', newTier);

      sponsorship.tier = newTier ?? undefined; // Chuyển null thành undefined để khớp với entity
      await this.sponsorshipRepo.save(sponsorship);
      console.log(
        `Updated sponsorship ${sponsorship.id} with tier: ${newTier ? newTier.name : 'null'}`,
      );
    }
  }
}
