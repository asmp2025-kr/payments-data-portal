import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { logger } from './common/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('PORT', 3000);

  app.use(helmet());
  const corsOrigins = config.get<string>('CORS_ORIGINS', 'http://localhost:4000')
    .split(',').map(s => s.trim());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  // OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Payments Data Product Portal API')
    .setDescription('Enterprise SaaS API for payments analytics, dashboards, and reporting')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth')
    .addTag('tenants')
    .addTag('users')
    .addTag('clearing')
    .addTag('settlement')
    .addTag('accounts')
    .addTag('cards')
    .addTag('fraud')
    .addTag('aml')
    .addTag('compliance')
    .addTag('scheme')
    .addTag('reconciliation')
    .addTag('finance')
    .addTag('data-products')
    .addTag('dashboards')
    .addTag('reports')
    .addTag('subscriptions')
    .addTag('notifications')
    .addTag('audit')
    .addTag('search')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.info(`Payments Portal API running on port ${port}`);
  logger.info(`OpenAPI docs: http://localhost:${port}/api/docs`);
}

bootstrap();
