import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { CategoriaOutput } from './categoria.output';

@ObjectType('Produto')
export class ProdutoOutput {
  @Field(() => ID)
  id: string;

  @Field()
  nome: string;

  @Field(() => String, { nullable: true })
  descricao: string | null;

  @Field(() => Float)
  preco: number;

  @Field()
  sku: string;

  @Field(() => String, { nullable: true })
  imagemUrlPrincipal: string | null;

  @Field(() => CategoriaOutput)
  categoria: CategoriaOutput;

  @Field(() => Boolean)
  emEstoque: boolean;

  @Field(() => Int, { description: 'Quantidade atual em estoque' })
  quantidadeEstoque: number; 
  
}

