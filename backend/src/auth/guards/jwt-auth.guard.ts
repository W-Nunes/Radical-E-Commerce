import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { AuthGuard, IAuthModuleOptions  } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext();
    const request = gqlContext.req; // Simplificar acesso

    // --- ADICIONAR LOG DO HEADER ---
    if (request?.headers) {
         const authHeader = request.headers['authorization'] || request.headers['Authorization']; // Checar ambas as capitalizações
         this.logger.verbose(`[getRequest] Header Authorization recebido: ${authHeader ? authHeader.substring(0, 15) + '...' : 'AUSENTE'}`);
    } else {
         this.logger.warn(`[getRequest] Objeto 'req' ou 'req.headers' não encontrado no contexto GraphQL.`);
    }
    // -------------------------------

    if (request) {
         this.logger.debug(`[getRequest] Retornando 'req' do contexto GraphQL para Passport.`);
         return request; // Retorna o request encontrado
    }

    this.logger.warn(`[getRequest] Não foi possível encontrar 'req' no contexto GraphQL. Tentando contexto HTTP padrão (fallback).`);
    return context.switchToHttp().getRequest();
  }
  getAuthenticateOptions(): IAuthModuleOptions {
    this.logger.debug('[getAuthenticateOptions] Forçando { session: false } para autenticação JWT.');
    return { session: false };
  }
}