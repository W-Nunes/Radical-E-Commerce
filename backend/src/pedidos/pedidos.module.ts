import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

// Entidades
import { PedidoEntity } from '../database/entities/pedidos.entity';
import { ItemPedidoEntity } from '../database/entities/item-pedido.entity';
import { Carrinho } from '../database/entities/carrinho.entity';
import { ItemCarrinho } from '../database/entities/item-carrinho.entity';

// Módulos
import { AuthModule } from '../auth/auth.module';
import { ProdutosModule } from '../produtos/produtos.module';
import { PagamentosModule } from '../pagamentos/pagamentos.module';

// Serviços
import { CarrinhoService } from './carrinho.service';
import { PedidosService } from './pedidos.service';

// Resolvers
import { CarrinhoResolver, ItemCarrinhoResolver } from './carrinho.resolver'; // <--- Importar AMBOS resolvers
import { PedidosResolver } from './pedidos.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([
        PedidoEntity,
        ItemPedidoEntity,
        Carrinho,
        ItemCarrinho // <-- Incluir ItemCarrinho aqui
    ]),
    // forwardRef(AuthModule), // Remover se não houver dependência circular real
    AuthModule, // Importar normalmente
    ProdutosModule, // Essencial para injetar ProdutosService no ItemCarrinhoResolver
    HttpModule,
    forwardRef(() => PagamentosModule), // Manter se PedidosService injetar PagamentosService e vice-versa
  ],
  providers: [
    CarrinhoService,
    PedidosService,
    CarrinhoResolver,   // Resolver principal do Carrinho
    ItemCarrinhoResolver, // <--- Adicionar o resolver do item aninhado
    PedidosResolver,
  ],
  exports: [PedidosService, CarrinhoService],
})
export class PedidosModule {}