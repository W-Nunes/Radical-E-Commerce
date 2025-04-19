import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql'; // Importar registerEnumType
import { ItemPedidoType } from './item-pedido.output';
import { OrderStatus } from '../../database/entities/pedidos.entity'; // Importar o Enum

// Registrar o Enum para uso no GraphQL
registerEnumType(OrderStatus, {
    name: 'OrderStatus', // Nome do tipo Enum no schema GraphQL
    description: 'Status possíveis de um pedido',
});

@ObjectType('Pedido')
export class PedidoType {
  @Field(() => ID) // Pedido ID é UUID/string
  id: string;

  @Field(() => ID) // Usuario ID é UUID/string
  usuarioId: string;

  @Field(() => Float)
  valorTotal: number;

  @Field(() => OrderStatus) // <-- Usar o Enum registrado
  status: OrderStatus;

  @Field(() => String, { nullable: true }) // Manter como string por simplicidade ou criar EnderecoType
  enderecoEntrega: string | null;

  @Field(() => String, { nullable: true })
  enderecoFaturamento?: string | null;

  @Field()
  criadoEm: Date;

  @Field({ nullable: true })
  atualizadoEm?: Date;

  @Field(() => [ItemPedidoType], { nullable: 'itemsAndList' })
  itens: ItemPedidoType[];
}