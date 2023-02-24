import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Load .env file
  dotenv.config();

  app.enableCors({
    origin: process.env.APP_URL,
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization',
    methods: 'GET,PUT,POST,DELETE',
  });

  await app.listen(3001);
}
bootstrap();
