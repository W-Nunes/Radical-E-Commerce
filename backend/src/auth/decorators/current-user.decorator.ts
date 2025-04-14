// radical/backend/src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
// <<< 1. Importar UserEntity do local correto
import { UserEntity } from '../../database/entities/user.entity';

// Removido MockUser

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserEntity => { // <<< 2. Tipo de retorno é UserEntity
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // Retorna o usuário anexado pelo Passport (será UserEntity)
    return request.user;
  },
);