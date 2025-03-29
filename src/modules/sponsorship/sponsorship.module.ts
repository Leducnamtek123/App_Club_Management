// src/modules/sponsorships/sponsorship.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SponsorshipEntity } from './sponsorship.entity';
import { SponsorshipService } from './sponsorship.service';
import { SponsorshipController } from './sponsorship.controller';
import { UserEntity } from '../user/user.entity';
import { EventEntity } from '../event/event.entity';
import { SponsorshipTierEntity } from '../sponsorship-tier/sponsorship-tier.entity';
import { CloudinaryStorageService } from 'shared/services/cloudinary-storage.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            SponsorshipEntity,
            UserEntity,
            EventEntity,
            SponsorshipTierEntity,
        ]
        ),

    ],
    providers: [SponsorshipService, { provide: 'IStorageService', useClass: CloudinaryStorageService },
    ],
    controllers: [SponsorshipController],
})
export class SponsorshipModule { }
