import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // Opcional

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CONFIGURAÇÃO DE CORS
  app.enableCors({
    origin: 'http://localhost:5173', // Seu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  // -----------------------------------------

  // Opcional: Validação global
 app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  // Inicia o servidor backend
  await app.listen(3000);
  console.log(`Backend rodando em: ${await app.getUrl()}`);
  console.log(`GraphQL Playground: ${await app.getUrl()}/graphql`);
}
bootstrap();