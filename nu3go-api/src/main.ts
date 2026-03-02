import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    // Debug: log env var presence (not values) on startup
    logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.log(`PORT: ${process.env.PORT}`);
    logger.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
    logger.log(`REDIS_URL set: ${!!process.env.REDIS_URL}`);

    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
        abortOnError: false,
    });

    // Global prefix
    app.setGlobalPrefix('v1');

    // CORS
    app.enableCors({
        origin: process.env.FRONTEND_URL || '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // Global validation pipe
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // Global response envelope
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Swagger API docs
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('nu3go API')
            .setDescription('nu3go Subscription Management Platform')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('docs', app, document);
        logger.log('Swagger UI available at /docs');
    }

    const port = process.env.PORT || 3001;
    await app.listen(port, '0.0.0.0');
    logger.log(`nu3go API running on port ${port}`);
}

bootstrap();
