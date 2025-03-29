import path from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ThrottlerOptions } from '@nestjs/throttler';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserSubscriber } from '../../entity-subscribers/user-subscriber';
import { SnakeNamingStrategy } from '../../snake-naming.strategy';
import ms from 'ms';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  private getNumber(key: string, defaultValue?: number): number {
    const value = this.get(key, defaultValue?.toString());
    try {
      return Number(value);
    } catch {
      throw new Error(`${key} environment variable is not a number`);
    }
  }

  private getDuration(key: string, _format?: string): number {
    const value = this.getString(key);
    const duration = ms(value);
    if (typeof duration !== 'number' || isNaN(duration)) {
      throw new Error(`${key} environment variable is not a valid duration`);
    }
    return duration;
  }

  private getBoolean(key: string, defaultValue?: boolean): boolean {
    const value = this.get(key, defaultValue?.toString());
    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(`${key} env var is not a boolean`);
    }
  }

  private getString(key: string, defaultValue?: string): string {
    const value = this.get(key, defaultValue);
    return value.replaceAll(String.raw`\n`, '\n');
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV', 'development');
  }

  get fallbackLanguage(): string {
    return this.getString('FALLBACK_LANGUAGE', 'en');
  }

  getThrottlerConfigs(): ThrottlerOptions {
    const ttl = this.getDuration('THROTTLER_TTL', 'second');
    const limit = this.getNumber('THROTTLER_LIMIT');
    return { ttl, limit };
  }

  get postgresConfig(): TypeOrmModuleOptions {
    const entities = [
      path.join(__dirname, `../../modules/**/*.entity{.ts,.js}`),
      path.join(__dirname, `../../modules/**/*.view-entity{.ts,.js}`),
    ];
    const migrations = [
      path.join(__dirname, `../../database/migrations/*{.ts,.js}`),
    ];

    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (databaseUrl) {
      // Nếu có DATABASE_URL, sử dụng nó
      return {
        entities,
        migrations,
        dropSchema: this.isTest,
        type: 'postgres',
        url: databaseUrl, // Sử dụng URL trực tiếp
        subscribers: [UserSubscriber],
        migrationsRun: true,
        logging: this.getBoolean('ENABLE_ORM_LOGS', false),
        namingStrategy: new SnakeNamingStrategy(),
        ssl: this.isProduction ? { rejectUnauthorized: false } : false, // Hỗ trợ SSL cho Neon
        synchronize: false, // Tắt synchronize trên production
      };
    }

    // Fallback khi không có DATABASE_URL (local)
    return {
      entities,
      migrations,
      dropSchema: this.isTest,
      type: 'postgres',
      host: this.getString('DB_HOST', 'localhost'),
      port: this.getNumber('DB_PORT', 5432),
      username: this.getString('DB_USERNAME', 'postgres'),
      password: this.getString('DB_PASSWORD', '12345678'),
      database: this.getString('DB_DATABASE', 'club_management'),
      subscribers: [UserSubscriber],
      migrationsRun: true,
      logging: this.getBoolean('ENABLE_ORM_LOGS', false),
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: false,
    };
  }

  get awsS3Config() {
    return {
      bucketRegion: this.getString('AWS_S3_BUCKET_REGION'),
      bucketApiVersion: this.getString('AWS_S3_API_VERSION'),
      bucketName: this.getString('AWS_S3_BUCKET_NAME'),
    };
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION', false);
  }

  get natsEnabled(): boolean {
    return this.getBoolean('NATS_ENABLED', false);
  }

  get natsConfig() {
    return {
      host: this.getString('NATS_HOST'),
      port: this.getNumber('NATS_PORT'),
    };
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
      jwtRefreshExpirationTime: this.getNumber('JWT_REFRESH_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT', '3000'),
    };
  }

  private get(key: string, defaultValue?: string): string {
    const value = this.configService.get<string>(key) ?? defaultValue;
    if (value == null) {
      throw new Error(`${key} environment variable does not set`);
    }
    return value;
  }
}