// radical/backend/src/pedidos/dto/item-pedido.output.ts
import { ObjectType, Field, Int, Float, ID, GraphQLISODateTime, registerEnumType } from '@nestjs/graphql'; // Importar String se for usar explicitamente, mas geralmente não precisa para primitivos

@ObjectType('ItemPedido') // Mantendo seu nome de classe
export class ItemPedidoType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  produtoId: string;

  // --- CORREÇÃO AQUI ---
  // Adicionar () => String como primeiro argumento do Field
  @Field(() => String, { nullable: true }) // Informa explicitamente que é String e pode ser nulo
  nomeProduto: string | null;
  // --- FIM CORREÇÃO ---

  // --- CORREÇÃO AQUI ---
  // Adicionar () => String como primeiro argumento do Field
  @Field(() => String, { nullable: true }) // Informa explicitamente que é String e pode ser nulo
  skuProduto: string | null;
  // --- FIM CORREÇÃO ---

  @Field(() => Int)
  quantidade: number;

  @Field(() => Float)
  precoUnitarioCompra: number;

  // Adicionar outros campos se existirem na entidade/necessários no output
}