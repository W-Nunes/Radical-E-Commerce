// radical/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ProdutosModule } from './produtos/produtos.module';
import { SeedModule } from './seed/seed.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { PagamentosModule } from './pagamentos/pagamentos.module';

// --- CORREÇÃO IMPORTAÇÕES ---
import { UserEntity } from './database/entities/user.entity';
import { ProdutoEntity } from './database/entities/produto.entity';
import { CategoriaEntity } from './database/entities/categoria.entity';
import { PedidoEntity } from './database/entities/pedidos.entity'; // Arquivo renomeado
import { ItemPedidoEntity } from './database/entities/item-pedido.entity'; // Arquivo renomeado
import { Carrinho } from './database/entities/carrinho.entity';
import { ItemCarrinho } from './database/entities/item-carrinho.entity';
// --- FIM CORREÇÃO ---

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PGHOST', 'localhost'),
        port: configService.get<number>('PGPORT', 5432),
        username: configService.get<string>('PGUSER'),
        password: configService.get<string>('PGPASSWORD'),
        database: configService.get<string>('PGDATABASE'),
        // É crucial listar TODAS as entidades aqui se não usar autoLoadEntities: true
        entities: [
          UserEntity, ProdutoEntity, CategoriaEntity, PedidoEntity, ItemPedidoEntity, Carrinho, ItemCarrinho // Nomes das entidades consistentes
       ],
       synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false), // Manter false em produção!
       // schema: 'public', // Seus schemas são definidos nas entidades (@Entity({ schema: '...' }))
       ssl: { require: true, rejectUnauthorized: false },
     }),
     inject: [ConfigService],
   }),
   GraphQLModule.forRoot<ApolloDriverConfig>({
     driver: ApolloDriver,
     autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
     sortSchema: true,
     playground: process.env.NODE_ENV !== 'production',
     introspection: process.env.NODE_ENV !== 'production',
   }),
   AuthModule,
   ProdutosModule,
   SeedModule,
   PedidosModule,    // <-- Registrado
   PagamentosModule, // <-- Registrado
 ],
 controllers: [AppController],
 providers: [AppService],
})
export class AppModule {}