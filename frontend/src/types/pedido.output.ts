// radical/frontend/src/types/pedido.output.ts

// <<< ALTERAÇÃO: Importando os tipos que serão aninhados
import type { ItemPedidoType } from './item-pedido.output';
import type { OrderStatus } from './order-status.enum';
import type { UserOutput } from './user.output'; // Tipo para o usuário
import type { EnderecoOutputType } from './endereco.output'; // Nosso novo tipo

export interface PedidoType {
  __typename?: 'PedidoType'; // Verifique se o nome do tipo no backend é 'Pedido' ou 'PedidoType' ou 'PedidoOutput'
  id: string;
  valorTotal: number;
  status: OrderStatus; // Mantém o Enum para consistência

  // <<< ALTERAÇÃO: Usa o tipo específico para o endereço
  enderecoEntrega: EnderecoOutputType;

  // <<< ALTERAÇÃO: Opcional, mas também usa o tipo específico
  enderecoFaturamento?: EnderecoOutputType | null;

  // <<< ALTERAÇÃO: Troca usuarioId por um objeto de usuário
  usuario: UserOutput | null; // O usuário pode ser nulo

  criadoEm: string | Date;
  atualizadoEm?: string | Date;
  itens: ItemPedidoType[];
}