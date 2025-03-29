import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // Nếu dùng Express

export function setupSwagger(app: INestApplication): void {
  const documentBuilder = new DocumentBuilder().setTitle('API').addBearerAuth();

  if (process.env.API_VERSION) {
    documentBuilder.setVersion(process.env.API_VERSION);
  }

  const document = SwaggerModule.createDocument(app, documentBuilder.build());

  // Nếu dùng Express làm adapter (NestExpressApplication)
  const expressApp = app as NestExpressApplication;
  expressApp.useStaticAssets(
    join(__dirname, '..', 'node_modules', 'swagger-ui-dist'),
    {
      prefix: '/documentation/static/', // Đường dẫn để truy cập file tĩnh
    },
  );

  SwaggerModule.setup('documentation', app, document, {
    explorer: true,
    customCssUrl: '/documentation/static/swagger-ui.css', // File từ thư mục tĩnh
    customJs: [
      '/documentation/static/swagger-ui-bundle.js',
      '/documentation/static/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      url: '/documentation/json', // Endpoint JSON
    },
  });

  // Phục vụ tài liệu JSON
  app.getHttpAdapter().get('/documentation/json', (_req, res) => {
    res.json(document);
  });

  console.info(`Documentation: /documentation`);
}
