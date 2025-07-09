import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
// --- NOVAS IMPORTAÇÕES ---
import { ConfigModule, ConfigService } from '@nestjs/config';

// Importe seus módulos existentes
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProdutosModule } from './produtos/produtos.module';
import { AuthModule } from './auth/auth.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    // --- MÓDULO DE CONFIGURAÇÃO ---
    ConfigModule.forRoot({
      isGlobal: true, // Torna o ConfigModule disponível globalmente
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignora o .env em produção
    }),

    // --- MÓDULO DO BANCO DE DADOS (DINÂMICO) ---
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Importa o ConfigModule para usar o ConfigService
      inject: [ConfigService], // Injeta o ConfigService
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: true, // CUIDADO: Em produção, use migrations

        ssl: { rejectUnauthorized: false }, 
      }),
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),

    // Seus outros módulos
    ProdutosModule,
    AuthModule,
    PedidosModule,
    PagamentosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}