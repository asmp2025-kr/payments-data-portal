"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const logger_1 = require("./common/logger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log'],
    });
    const config = app.get(config_1.ConfigService);
    const port = parseInt(process.env.PORT || '3000', 10);
    app.use((0, helmet_1.default)());
    const corsOrigins = config.get('CORS_ORIGINS', 'http://localhost:4000')
        .split(',').map(s => s.trim());
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    const swaggerConfig = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    await app.listen(port);
    logger_1.logger.info(`Payments Portal API running on port ${port}`);
    logger_1.logger.info(`OpenAPI docs: http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map