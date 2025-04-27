// radical/backend/src/pedidos/dto/pedido.output.ts
import { ObjectType, Field, ID, Float, GraphQLISODateTime } from '@nestjs/graphql'; // Importar GraphQLISODateTime para datas
import { OrderStatus } from '../../database/entities/pedidos.entity';
import { UserOutput } from '../../auth/dto/user.output';
import { ItemPedidoType } from './item-pedido.output'; // Usando seu ItemPedidoType
// --- Importar o NOVO DTO de Output ---
import { EnderecoOutput } from './endereco.output'; // <<< ALTERADO
// --- Fim Importação ---

@ObjectType('Pedido')
export class PedidoOutput {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  valorTotal: number;

  @Field(() => OrderStatus) // OK - OrderStatus foi registrado na entidade
  status: OrderStatus;

  // --- Usar o EnderecoOutput ---
  @Field(() => EnderecoOutput) // <<< ALTERADO
  enderecoEntrega: EnderecoOutput; // <<< Tipo TS e GraphQL alterados

  @Field(() => EnderecoOutput, { nullable: true }) // <<< ALTERADO
  enderecoFaturamento?: EnderecoOutput; // <<< Tipo TS e GraphQL alterados
  // --- Fim da Alteração ---

  @Field(() => [ItemPedidoType])
  itens: ItemPedidoType[];

  @Field(() => UserOutput) // Pode precisar de ResolveField
  usuario: UserOutput;

  // Usar GraphQLISODateTime para datas é mais padronizado
  @Field(() => GraphQLISODateTime)
  criadoEm: Date; // O TS pode ser Date, o GraphQL será String ISO

  @Field(() => GraphQLISODateTime)
  atualizadoEm: Date; // O TS pode ser Date, o GraphQL será String ISO
}