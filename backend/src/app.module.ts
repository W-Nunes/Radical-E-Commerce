import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProdutosModule } from './produtos/produtos.module'; // << IMPORTAR

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // Carrega entidades registradas via forFeature
        synchronize: true, // DEV ONLY! Use migrations em produção.
        logging: false,
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'), // Gera schema na pasta src
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    // == Registra o módulo de Produtos ==
    ProdutosModule,
    // == Registre outros módulos de features aqui ==
    // AuthModule,
    // PedidosModule,
  ],
  controllers: [], // Controllers geralmente ficam nos módulos de features
  providers: [], // Providers geralmente ficam nos módulos de features
})
export class AppModule {}