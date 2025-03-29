import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import {
  ClassSerializerInterceptor,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { UnprocessableEntityException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AdminSeeder } from './database/migrations/seeders/admin.seeder';
import { HttpExceptionFilter } from './filters/bad-request.filter';
import { QueryFailedFilter } from './filters/query-failed.filter';
import { setupSwagger } from './setup-swagger';
import { ApiConfigService } from './shared/services/api-config.service';
import { SharedModule } from './shared/shared.module';
import './boilerplate.polyfill';
import * as path from 'path';

// Biến toàn cục để lưu ứng dụng đã khởi tạo
let cachedApp: NestExpressApplication | null = null;

async function initializeApp(): Promise<NestExpressApplication> {
  // Nếu đã khởi tạo, trả về cached app
  if (cachedApp) return cachedApp;

  initializeTransactionalContext();
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { cors: true },
  );

  const seeder = app.get(AdminSeeder);
  await seeder.run();
  app.enable('trust proxy');
  app.use(helmet());
  app.use(compression());
  app.use(morgan('combined'));
  app.enableVersioning();

  const reflector = app.get(Reflector);
  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      dismissDefaultMessages: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const configService = app.select(SharedModule).get(ApiConfigService);
  if (configService.natsEnabled) {
    const natsConfig = configService.natsConfig;
    app.connectMicroservice({
      transport: Transport.NATS,
      options: {
        url: `nats://${natsConfig.host}:${natsConfig.port}`,
        queue: 'main_service',
      },
    });
    await app.startAllMicroservices();
  }

  app.useStaticAssets(path.join(__dirname, 'public'), {
    prefix: '/documentation/',
  });
  if (configService.documentationEnabled) {
    setupSwagger(app);
  }

  if (!configService.isDevelopment) {
    app.enableShutdownHooks();
  }

  await app.init(); // Khởi tạo ứng dụng đầy đủ
  cachedApp = app; // Lưu vào cache
  return app;
}

// Handler cho Vercel Serverless
export default async (req: any, res: any) => {
  const app = await initializeApp();
  const server = app.getHttpAdapter().getInstance();
  return server(req, res);
};

if (require.main === module) {
  async function bootstrap() {
    const app = await initializeApp();
    const configService = app.select(SharedModule).get(ApiConfigService);
    const port = configService.appConfig.port || 3000;
    await app.listen(port);
    console.log(`Application is running on port ${port}`);
  }

  bootstrap().catch((err) => {
    console.error('Error starting application:', err);
  });
}
