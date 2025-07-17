import type { ItemPedidoType } from './item-pedido.output';
import type { OrderStatus } from './order-status.enum';
import type { UserOutput } from './user.output';
import type { EnderecoOutputType } from './endereco.output';

export interface PedidoType {
  __typename?: 'PedidoType'; 
  id: string;
  valorTotal: number;
  status: OrderStatus; // Mantém o Enum para consistência

  enderecoEntrega: EnderecoOutputType;
  enderecoFaturamento?: EnderecoOutputType | null;
  usuario: UserOutput | null;

  criadoEm: string | Date;
  atualizadoEm?: string | Date;
  itens: ItemPedidoType[];
}