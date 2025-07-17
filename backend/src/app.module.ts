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
import { FreteModule } from './frete/frete.module';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Define se SSL deve ser usado.
        // Em 'test', não usamos SSL. Em 'development' (ou qualquer outro caso), usamos.
        const useSsl = configService.get<string>('NODE_ENV') !== 'test';

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          
          // Aplica a configuração de SSL condicionalmente
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          
          entities: [join(__dirname, '**', '*.entity.{ts,js}')],
          // Em um ambiente de teste, é seguro sincronizar.
          // Para produção, o ideal é usar migrations.
          synchronize: true, 
        };
      },
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
    }),

    // Outros módulos
    ProdutosModule,
    AuthModule,
    PedidosModule,
    PagamentosModule,
    SeedModule,
    FreteModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}