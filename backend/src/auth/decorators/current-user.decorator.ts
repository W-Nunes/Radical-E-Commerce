import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserEntity } from '../../database/entities/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): UserEntity => { 
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    // Retorna o usuário anexado pelo Passport
    return request.user;
  },
);