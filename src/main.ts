import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('42Pong')
    .setDescription('4:04 Squad - ft_transcendence')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
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
