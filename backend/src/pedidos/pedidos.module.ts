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
import { CarrinhoResolver, ItemCarrinhoResolver } from './carrinho.resolver'; 
import { PedidosResolver } from './pedidos.resolver';


@Module({
  imports: [
    TypeOrmModule.forFeature([
        PedidoEntity,
        ItemPedidoEntity,
        Carrinho,
        ItemCarrinho 
    ]),

    AuthModule, 
    ProdutosModule, 
    forwardRef(() => PagamentosModule),
  ],
  providers: [
    CarrinhoService,
    PedidosService,
    CarrinhoResolver,  
    ItemCarrinhoResolver,
    PedidosResolver,
  ],
  exports: [PedidosService, CarrinhoService],
})
export class PedidosModule {}