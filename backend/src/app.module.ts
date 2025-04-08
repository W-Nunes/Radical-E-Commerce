import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProdutosModule } from './produtos/produtos.module';
import { SeedModule } from './seed/seed.module'; // <<< IMPORTAR O SEED MODULE

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      // ... (configuração TypeORM como antes) ...
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('PGHOST');
        const database = configService.get<string>('PGDATABASE');
        const username = configService.get<string>('PGUSER');
        const password = configService.get<string>('PGPASSWORD');
        const port = configService.get<number>('PGPORT', 5432);

        if (!host || !database || !username || !password) {
          throw new Error('Variáveis de ambiente do banco de dados não configuradas corretamente no .env');
        }

        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          autoLoadEntities: true,
          synchronize: true,
          logging: false,
          ssl: {
            rejectUnauthorized: false,
          }
        };
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    ProdutosModule,
    SeedModule, // <<< ADICIONAR O SEED MODULE AQUI
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}