import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Categoria') // Nome do tipo no Schema GraphQL
export class CategoriaOutput {
  @Field(() => ID)
  id: string;

  @Field()
  nome: string;

  @Field()
  slug: string;

  // Não expomos a descrição aqui, talvez?
}