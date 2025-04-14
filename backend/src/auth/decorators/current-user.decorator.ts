import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../database/entities/user.entity'; // Importe sua entidade de usuário

// Cria um decorator chamado @CurrentUser()
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserEntity => {
    // Cria o contexto GraphQL a partir do ExecutionContext padrão
    const ctx = GqlExecutionContext.create(context);
    // Extrai o objeto 'req' do contexto GraphQL (onde o Passport anexa o usuário)
    const request = ctx.getContext().req;
    // Retorna a propriedade 'user' anexada ao request pela JwtStrategy
    // Se 'user' não existir, retornará undefined (o Guard deve prevenir isso)
    return request.user;
  },
);