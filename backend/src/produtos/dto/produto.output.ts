import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { CategoriaOutput } from './categoria.output';

@ObjectType('Produto') // Nome do tipo no Schema GraphQL
export class ProdutoOutput {
  @Field(() => ID)
  id: string;

  @Field()
  nome: string;

  @Field({ nullable: true })
  descricao?: string;

  @Field(() => Float)
  preco: number;

  @Field()
  sku: string;

  @Field({ nullable: true })
  imagemUrlPrincipal?: string;

  // Expondo a categoria como um tipo aninhado no GraphQL
  @Field(() => CategoriaOutput)
  categoria: CategoriaOutput;

  // Exemplo: Campo calculado ou com lógica diferente da entidade
  @Field(() => Boolean)
  emEstoque: boolean; // Será calculado no resolver

  // Não expomos quantidadeEstoque diretamente
}