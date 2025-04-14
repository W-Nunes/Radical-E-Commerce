import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Usuario') // Nome que aparecerá no schema GraphQL
export class UserOutput {
    @Field(() => ID) // Expõe como ID GraphQL
    id: string;

    @Field()
    nome: string;

    @Field()
    email: string;

    @Field(() => Date) // Expõe como DateTime ou similar no GraphQL
    criadoEm: Date;

    // Não incluímos passwordHash nem atualizadoEm aqui por padrão
}