// Define a estrutura de um Pedido, como vem da API
import type { ItemPedidoType } from './item-pedido.output'; // Importa o tipo do item
// Importar o Enum OrderStatus se for usar ele aqui também
import type { OrderStatus } from './order-status.enum'; // Crie este arquivo se for usar o Enum no frontend

export interface PedidoType {
  __typename?: 'PedidoType';
  id: string; // ID do Pedido (UUID/string)
  usuarioId: string; // ID do Usuário (UUID/string)
  valorTotal: number;
  status: OrderStatus | string; // Pode ser o enum ou a string correspondente
  // Endereços podem ser objetos ou strings JSON, dependendo de como o backend retorna no GraphQL
  enderecoEntrega: string | object | null; // Ajuste conforme necessidade
  enderecoFaturamento?: string | object | null; // Ajuste conforme necessidade
  criadoEm: string | Date;
  atualizadoEm?: string | Date;
  itens: ItemPedidoType[];
}