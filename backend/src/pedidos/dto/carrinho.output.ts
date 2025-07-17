import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { ItemCarrinhoOutput } from './item-carrinho.output';

@ObjectType('Carrinho')
export class CarrinhoOutput {
  @Field(() => ID)
  id: string;

  @Field(() => [ItemCarrinhoOutput], { nullable: 'itemsAndList' })
  itens: ItemCarrinhoOutput[];

  @Field(() => Float)
  total: number;

  @Field()
  criadoEm: Date;

  @Field()
  atualizadoEm: Date;
}