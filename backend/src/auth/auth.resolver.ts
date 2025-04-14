// radical/backend/src/auth/auth.resolver.ts
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe, InternalServerErrorException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroInput } from './dto/registro.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth.payload';
import { UserOutput } from './dto/user.output';
import { JwtAuthGuard } from './guards/jwt-auth.guard'; // Usa o guard customizado
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../database/entities/user.entity'; // <<< Importa a entidade real

@Resolver(() => UserOutput)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserOutput, { name: 'registrar', description: 'Registra um novo usuário.' })
  @UsePipes(ValidationPipe)
  async registrar(
    @Args('dadosRegistro') dadosRegistro: RegistroInput,
  ): Promise<UserOutput> {
    this.logger.debug('[Resolver Radical] Recebida mutation registrar');
    // AuthService.registrar retorna Omit<UserEntity, 'passwordHash'>
    const usuarioRegistrado = await this.authService.registrar(dadosRegistro);
    this.logger.debug('[Resolver Radical] Usuário registrado pelo service');
    // Mapeia para UserOutput (tipos compatíveis)
    return usuarioRegistrado;
  }

  @Mutation(() => AuthPayload, { name: 'login', description: 'Autentica um usuário e retorna um token JWT.' })
  @UsePipes(ValidationPipe)
  async login(
    @Args('dadosLogin') dadosLogin: LoginInput,
  ): Promise<AuthPayload> {
     this.logger.debug('[Resolver Radical] Recebida mutation login');
      const payloadLogin = await this.authService.login(dadosLogin);
      this.logger.debug('[Resolver Radical] Login realizado pelo service');
      return payloadLogin;
  }

  @Query(() => UserOutput, { name: 'meuPerfil', description: 'Retorna dados do usuário logado.' })
  @UseGuards(JwtAuthGuard) // Usa o guard customizado
  meuPerfil(
    // <<< CORRIGIDO: Usa UserEntity aqui
    @CurrentUser() usuario: UserEntity,
  ): UserOutput {
    this.logger.debug(`[Resolver Radical meuPerfil] Query acessada.`);
    this.logger.debug(`[Resolver Radical meuPerfil] Usuário recebido via @CurrentUser: ${usuario?.email} (ID: ${usuario?.id})`);

    if (!usuario) {
         this.logger.error('[Resolver Radical meuPerfil] CurrentUser retornou undefined mesmo após JwtAuthGuard!');
         throw new InternalServerErrorException('Erro interno ao obter dados do usuário logado.');
    }

    // Mapeia UserEntity para UserOutput
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm
        // Mapeie outros campos se necessário
    };
  }
}