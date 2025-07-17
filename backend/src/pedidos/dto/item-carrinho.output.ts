import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { ProdutoOutput } from '../../produtos/dto/produto.output'; 

@ObjectType('ItemCarrinho') // Nome do tipo no GraphQL
export class ItemCarrinhoOutput { 

  @Field(() => Int) 
  id: number;

  @Field(() => ID) 
  produtoId: string;

  @Field(() => Int)
  quantidade: number;

  @Field(() => Float)
  precoUnitarioRegistrado: number;

  @Field()
  adicionadoEm: Date;

  @Field(() => ProdutoOutput, { nullable: true, description: 'Detalhes do produto associado a este item do carrinho (resolvido separadamente)' })
  produto?: ProdutoOutput | null;
}