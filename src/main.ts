import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Habilitar validação global
  app.useGlobalPipes(new ValidationPipe());

  // Prefixo global para as rotas da API
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
