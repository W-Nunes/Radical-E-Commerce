// radical/backend/src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service'; // <<< 1. Importar AuthService
import { UserEntity } from '../database/entities/user.entity'; // <<< 2. Importar UserEntity

// Removido UsersService (mock)

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // Usar logger com contexto do projeto principal
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    // <<< 3. Injetar AuthService (que agora usa TypeORM)
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    // Removida injeção do UsersService (mock)
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('Variável de ambiente JWT_SECRET não definida!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
    this.logger.debug(`[Constructor] JwtStrategy carregada. Segredo JWT usado: ${jwtSecret ? jwtSecret.substring(0, 5) + '...' : 'NÃO ENCONTRADO!'}`);
  }

  // <<< 4. Retorna Promise<UserEntity>
  async validate(payload: JwtPayload): Promise<UserEntity> {
       this.logger.debug(`[Validate] Iniciando validação para payload: ${JSON.stringify(payload)}`);
       const userId = payload.id ?? payload.sub;
       if (!userId) {
           this.logger.error('[Validate] Payload JWT inválido ou sem ID/SUB.');
           throw new UnauthorizedException('Token inválido (sem ID).');
        }

       this.logger.debug(`[Validate] Buscando usuário com ID: ${userId}`);
       // <<< 5. Chama o authService (que usa TypeORM)
       const usuario = await this.authService.encontrarUsuarioPorId(userId);

       if (!usuario) {
           this.logger.warn(`[Validate] Usuário com ID ${userId} (do token) não encontrado no banco.`);
           throw new UnauthorizedException(`Usuário associado ao token (ID: ${userId}) não encontrado.`);
        }

       this.logger.debug(`[Validate] Usuário ${usuario.email} (ID: ${userId}) encontrado e validado com sucesso.`);
       // <<< 6. Retorna a UserEntity completa encontrada
       return usuario;
  }
}