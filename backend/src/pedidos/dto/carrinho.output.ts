import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { ItemCarrinhoOutput } from './item-carrinho.output'; // Importar do arquivo correto

@ObjectType('Carrinho')
export class CarrinhoOutput {
  @Field(() => ID) // Carrinho ID é UUID/string
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