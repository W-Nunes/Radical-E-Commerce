import { ObjectType, Field } from '@nestjs/graphql';
import { UserOutput } from './user.output'; // Importa o tipo de usuário seguro

@ObjectType('AuthPayload')
export class AuthPayload {
  @Field()
  accessToken: string; // O token JWT gerado

  @Field(() => UserOutput) // Retorna os dados do usuário logado
  usuario: UserOutput;
}