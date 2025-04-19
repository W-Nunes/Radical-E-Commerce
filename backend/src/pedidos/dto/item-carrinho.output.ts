import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { ProdutoOutput } from '../../produtos/dto/produto.output'; // Importar o Output DTO do produto

@ObjectType('ItemCarrinho') // Nome do tipo no GraphQL
export class ItemCarrinhoOutput { // Renomeado para Output para consistência

  @Field(() => Int) // <-- Se o ID da entidade for number (increment)
  id: number;

  @Field(() => ID) // <-- Se o ID do produto for UUID/string
  produtoId: string;

  @Field(() => Int)
  quantidade: number;

  @Field(() => Float)
  precoUnitarioRegistrado: number;

  @Field()
  adicionadoEm: Date;

  // --- CAMPO PARA RESOLVER O PRODUTO ---
  @Field(() => ProdutoOutput, { nullable: true, description: 'Detalhes do produto associado a este item do carrinho (resolvido separadamente)' })
  produto?: ProdutoOutput | null; // O ResolveField vai preencher isso
  // --- FIM CAMPO PRODUTO ---
}