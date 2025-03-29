import { NotificationModule } from './modules/zalo-notification/zalo-notification.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClsModule } from 'nestjs-cls';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AdminSeeder } from './database/migrations/seeders/admin.seeder';
import { AuthModule } from './modules/auth/auth.module';
import { BranchModule } from './modules/branch/branch.module';
import { UserEntity } from './modules/user/user.entity';
import { UserModule } from './modules/user/user.module';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';
import { TransactionCategoryModule } from './modules/transaction-category/transaction-category.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { MembershipPaymentModule } from './modules/membership-payment/membership-payment.module';
import { FinanceReportModule } from 'modules/finance/finance-report.module';
import { MembershipFeeModule } from 'modules/membership-fee/membership-fee.module';
import { BullModule } from '@nestjs/bull';
import { ExportModule } from './modules/export/export.module';
import { EventsModule } from './modules/event/event.module';
import { SponsorshipTierModule } from './modules/sponsorship-tier/sponsorship-tier.module';
import { SponsorshipModule } from './modules/sponsorship/sponsorship.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TicketModule } from './modules/ticket/ticket.module';
import { HttpModule } from '@nestjs/axios';
import { ZnsModule } from './modules/zns/zns.module';
import { NewsModule } from 'modules/news/news.module';

let cachedDataSource: DataSource | null = null;

@Module({
  imports: [
    AuthModule,
    UserModule,
    MembershipPaymentModule,
    TransactionModule,
    EventsModule,
    SponsorshipModule,
    SponsorshipTierModule,
    FinanceReportModule,
    BranchModule,
    MembershipFeeModule,
    TransactionCategoryModule,
    NotificationModule,
    TicketModule,
    ExportModule,
    NewsModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
      },
    }),
    HttpModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRootAsync({
      imports: [SharedModule],
      useFactory: async (configService: ApiConfigService) => ({
        throttlers: [await configService.getThrottlerConfigs()], // Await Promise
      }),
      inject: [ApiConfigService],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [SharedModule],
      useFactory: (configService: ApiConfigService) =>
        configService.postgresConfig,
      inject: [ApiConfigService],
      dataSourceFactory: async (options) => {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        if (cachedDataSource) {
          return cachedDataSource; // Tái sử dụng nếu đã tồn tại
        }
        const dataSource = new DataSource(options);
        cachedDataSource = await dataSource.initialize(); // Khởi tạo lần đầu
        return addTransactionalDataSource(cachedDataSource);
      },
    }),
    TypeOrmModule.forFeature([UserEntity]),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ZnsModule,
  ],
  providers: [AdminSeeder],
  exports: [AdminSeeder],
})
export class AppModule {}
