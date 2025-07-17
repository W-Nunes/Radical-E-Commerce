import { ObjectType, Field, Int, Float, ID, GraphQLISODateTime, registerEnumType } from '@nestjs/graphql'; // Importar String se for usar explicitamente, mas geralmente não precisa para primitivos

@ObjectType('ItemPedido') 
export class ItemPedidoType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  produtoId: string;


  @Field(() => String, { nullable: true }) // Informa explicitamente que é String e pode ser nulo
  nomeProduto: string | null;

  // Adicionar () => String como primeiro argumento do Field
  @Field(() => String, { nullable: true }) 
  skuProduto: string | null;

  @Field(() => Int)
  quantidade: number;

  @Field(() => Float)
  precoUnitarioCompra: number;
}