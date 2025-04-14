import { Injectable, UnauthorizedException, InternalServerErrorException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { UserEntity } from '../../database/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new InternalServerErrorException('Variável de ambiente JWT_SECRET não definida!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // --- REVERTER AQUI ---
      secretOrKey: jwtSecret, // << Voltar ao segredo correto
      // ---------------------
    });

    // Pode remover o "(TESTE COM MODIFICAÇÃO)" do log se quiser
    this.logger.debug(`[Constructor] JwtStrategy carregada. Segredo JWT usado: ${jwtSecret ? jwtSecret.substring(0, 5) + '...' : 'NÃO ENCONTRADO!'}`);
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    this.logger.debug(`[Validate] Iniciando validação do payload JWT: ${JSON.stringify(payload)}`);

    // Verifica se o payload e o ID (ou 'sub') existem
    // Seu código usa 'id', vamos manter assim, assumindo que é o que está no payload
    if (!payload || !payload.id) {
      this.logger.error('[Validate] Payload JWT inválido ou sem ID.'); // Mensagem mais clara
      throw new UnauthorizedException('Token inválido ou payload não contém ID de usuário.');
    }

    const { id } = payload; // Usando 'id' como no seu código
    this.logger.debug(`[validate] Buscando usuário com ID (do token): ${id}`);

    const usuario = await this.authService.encontrarUsuarioPorId(id);

    if (!usuario) {
      // --- MELHORAR A MENSAGEM DE ERRO/LOG AQUI ---
      this.logger.warn(`[Validate] Usuário com ID ${id} (do token) não encontrado no banco.`);
      throw new UnauthorizedException(`Usuário associado ao token (ID: ${id}) não foi encontrado.`);
      // --------------------------------------------
    }

    this.logger.debug(`[validate] Usuário ${usuario.email} (ID: ${id}) encontrado e validado com sucesso pela Strategy.`);
    return usuario; // Passport injeta isso em request.user
  }
}