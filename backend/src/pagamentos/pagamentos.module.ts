// radical/backend/src/pagamentos/pagamentos.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { PagamentosService } from './pagamentos.service';
// Não precisamos de Controller ou Resolver aqui, pois é chamado internamente por PedidosService.
import { PedidosModule } from '../pedidos/pedidos.module'; // Importa o módulo de Pedidos
// Importar HttpModule se for usar chamadas HTTP em vez de injeção direta de serviço
// import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    // Usa forwardRef() para resolver a dependência circular:
    // PagamentosModule precisa de PedidosModule (para injetar PedidosService),
    // e PedidosModule precisa de PagamentosModule (para injetar PagamentosService).
    forwardRef(() => PedidosModule),
    // HttpModule // Descomente se PagamentosService usar HttpService para chamar PedidosService
  ],
  providers: [PagamentosService],
  exports: [PagamentosService], // Exporta o serviço para que PedidosModule possa importá-lo
})
export class PagamentosModule {}