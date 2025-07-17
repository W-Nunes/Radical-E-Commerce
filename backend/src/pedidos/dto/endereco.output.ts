import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('EnderecoOutput') // Nome do tipo no GraphQL
export class EnderecoOutput {
  @Field(() => String)
  rua: string;

  @Field(() => String)
  numero: string;

  @Field(() => String, { nullable: true })
  complemento?: string | null;

  @Field(() => String)
  bairro: string;

  @Field(() => String)
  cidade: string;

  @Field(() => String)
  estado: string;

  @Field(() => String)
  cep: string;
}