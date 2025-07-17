import { Module, forwardRef } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
import { PedidosModule } from '../pedidos/pedidos.module'; // Importa o módulo de Pedidos
// Importar HttpModule se for usar chamadas HTTP em vez de injeção direta de serviço
// import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    forwardRef(() => PedidosModule),
  ],
  providers: [PagamentosService],
  exports: [PagamentosService], // Exporta o serviço para que PedidosModule possa importá-lo
})
export class PagamentosModule {}