// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    if (request?.headers) {
         const authHeader = request.headers['authorization'] || request.headers['Authorization'];
         this.logger.verbose(`[getRequest Minimal] Header Authorization recebido: ${authHeader ? authHeader.substring(0, 15) + '...' : 'AUSENTE'}`);
    } else {
         this.logger.warn(`[getRequest Minimal] Objeto 'req' ou 'req.headers' não encontrado no contexto GraphQL.`);
    }

    if (request) {
         this.logger.debug(`[getRequest Minimal] Retornando 'req' do contexto GraphQL para Passport.`);
         return request;
    }

    this.logger.warn(`[getRequest Minimal] Não foi possível encontrar 'req' no contexto GraphQL. Tentando contexto HTTP padrão (fallback).`);
    return context.switchToHttp().getRequest();
  }

  getAuthenticateOptions(): IAuthModuleOptions {
    this.logger.debug('[getAuthenticateOptions Minimal] Forçando { session: false } para autenticação JWT.');
    return { session: false };
  }
}