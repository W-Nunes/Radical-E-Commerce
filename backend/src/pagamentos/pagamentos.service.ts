// radical/backend/src/pagamentos/pagamentos.service.ts
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PedidosService } from '../pedidos/pedidos.service';
// --- CORREÇÃO: Importar Enum ---
import { OrderStatus } from '../database/entities/pedidos.entity';

@Injectable()
export class PagamentosService {
  constructor(
    @Inject(forwardRef(() => PedidosService))
    private readonly pedidosService: PedidosService,
  ) {}

  // --- CORREÇÃO: Assinatura aceita (id: string, valor: number) ---
  async simularProcessamentoPagamento(pedidoId: string, valor: number): Promise<void> {
    console.log(`Simulando pagamento para pedido ${pedidoId} no valor de ${valor}...`);
    const sucesso = Math.random() > 0.1; // 90% de chance de sucesso

    // --- CORREÇÃO: Usar Enum ---
    const novoStatus = sucesso ? OrderStatus.PAID : OrderStatus.FAILED;

    console.log(`Simulação concluída. Status: ${novoStatus}`);

    try {
      // Passar ID string e o membro do Enum
      await this.pedidosService.atualizarStatusPedido(pedidoId, novoStatus);
    } catch (error) {
      console.error(`Erro ao atualizar status do pedido ${pedidoId}:`, error);
    }
  }
}