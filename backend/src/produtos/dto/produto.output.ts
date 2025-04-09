import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';
import { CategoriaOutput } from './categoria.output';

@ObjectType('Produto')
export class ProdutoOutput {
  @Field(() => ID)
  id: string;

  @Field()
  nome: string;

  // --- CORREÇÃO AQUI ---
  // Antes era:
  // @Field({ nullable: true })
  // descricao?: string;
  // Agora: Define explicitamente o tipo e a nulidade para GraphQL e TS
  @Field(() => String, { nullable: true })
  descricao: string | null;
  // ---------------------

  @Field(() => Float)
  preco: number;

  @Field()
  sku: string;

  // --- CORREÇÃO AQUI ---
  // Antes era:
  // @Field({ nullable: true })
  // imagemUrlPrincipal?: string;
  // Agora: Define explicitamente o tipo e a nulidade para GraphQL e TS
  @Field(() => String, { nullable: true })
  imagemUrlPrincipal: string | null;
  // ---------------------

  @Field(() => CategoriaOutput)
  categoria: CategoriaOutput;

  @Field(() => Boolean)
  emEstoque: boolean;

  @Field(() => Int, { description: 'Quantidade atual em estoque' }) // Expõe como Int no GraphQL
  quantidadeEstoque: number; // O tipo TypeScript é number
  
}

