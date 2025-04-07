import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ProdutosModule } from './produtos/produtos.module'; // Verifique se o caminho está correto

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Ajuste na configuração do TypeOrmModule para usar variáveis separadas
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Busca cada variável individualmente do .env
        const host = configService.get<string>('PGHOST');
        const database = configService.get<string>('PGDATABASE');
        const username = configService.get<string>('PGUSER');
        const password = configService.get<string>('PGPASSWORD');
        const port = configService.get<number>('PGPORT', 5432); // Usa 5432 como padrão se PGPORT não estiver no .env

        // Verifica se as variáveis essenciais foram carregadas
        if (!host || !database || !username || !password) {
          throw new Error('Variáveis de ambiente do banco de dados não configuradas corretamente no .env');
        }

        return {
          type: 'postgres', // Tipo do banco
          host: host,       // Host do Neon
          port: port,       // Porta (padrão 5432)
          username: username, // Usuário do Neon
          password: password, // Senha do Neon
          database: database, // Nome do banco no Neon
          autoLoadEntities: true,
          synchronize: true, // DEV ONLY!
          logging: false,
          // --- IMPORTANTE: Configuração SSL ainda é necessária para Neon ---
          ssl: {
            rejectUnauthorized: false, // Necessário para a maioria das conexões com Neon
          }
          // Não usamos a propriedade 'url' neste caso
        };
      },
    }),
    // Restante da configuração (GraphQLModule, ProdutosModule, etc.)
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
    }),
    ProdutosModule,
    // Outros módulos...
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}