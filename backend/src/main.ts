import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Enable raw body for webhook signature verification (Zoom, payment providers)
    rawBody: true,
  });

  // Enable cookie parsing for HttpOnly cookie-based auth
  app.use(cookieParser());

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Enable CORS for frontend (credentials: true is required for cookies)
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 SEU Short Courses API running on http://localhost:${port}`);
}
bootstrap();
