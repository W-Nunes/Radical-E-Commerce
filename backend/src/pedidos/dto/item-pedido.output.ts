import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';

@ObjectType('ItemPedido')
export class ItemPedidoType {
  @Field(() => ID) // ItemPedido ID é UUID/string
  id: string;

  @Field(() => ID) // Produto ID é UUID/string
  produtoId: string;

  @Field({ nullable: true }) // Permitir nulo pois está na entidade
  nomeProduto: string | null;

  @Field({ nullable: true }) // Permitir nulo pois está na entidade
  skuProduto: string | null;

  @Field(() => Int)
  quantidade: number;

  @Field(() => Float)
  precoUnitarioCompra: number;
}