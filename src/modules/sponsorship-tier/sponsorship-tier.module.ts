// src/modules/sponsorship-tiers/sponsorship-tier.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorshipTierEntity } from './sponsorship-tier.entity';
import { SponsorshipTierService } from './sponsorship-tier.service';
import { SponsorshipTierController } from './sponsorship-tier.controller';
import { EventEntity } from '../event/event.entity';
import { SponsorshipEntity } from '../sponsorship/sponsorship.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SponsorshipTierEntity,
      EventEntity,
      SponsorshipEntity,
    ]),
  ],
  providers: [SponsorshipTierService],
  controllers: [SponsorshipTierController],
})
export class SponsorshipTierModule {}
