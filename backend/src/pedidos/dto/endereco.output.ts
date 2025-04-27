// radical/backend/src/pedidos/dto/endereco.output.ts
import { ObjectType, Field } from '@nestjs/graphql';

// Este DTO espelha a estrutura que você precisa para SAÍDA
// Adapte os nomes dos campos se forem diferentes na sua entidade PedidoEntity
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