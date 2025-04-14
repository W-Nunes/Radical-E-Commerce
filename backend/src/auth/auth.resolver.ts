import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards, UsePipes, ValidationPipe, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistroInput } from './dto/registro.input';
import { LoginInput } from './dto/login.input';
import { AuthPayload } from './dto/auth.payload';
import { UserOutput } from './dto/user.output';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserEntity } from '../database/entities/user.entity';

@Resolver(() => UserOutput)
export class AuthResolver {
  private readonly logger = new Logger(AuthResolver.name);

  constructor(private readonly authService: AuthService) {}

  // --- MUTATIONS registrar e login (mantidas como no seu código) ---
  @Mutation(() => UserOutput, { name: 'registrar', description: 'Registra um novo usuário.' })
  @UsePipes(ValidationPipe)
  async registrar(
    @Args('dadosRegistro') dadosRegistro: RegistroInput,
  ): Promise<UserOutput> {
    const usuarioRegistrado = await this.authService.registrar(dadosRegistro);
    return {
        id: usuarioRegistrado.id,
        nome: usuarioRegistrado.nome,
        email: usuarioRegistrado.email,
        criadoEm: usuarioRegistrado.criadoEm,
    };
  }

  @Mutation(() => AuthPayload, { name: 'login', description: 'Autentica um usuário e retorna um token JWT.' })
  @UsePipes(ValidationPipe)
  async login(
    @Args('dadosLogin') dadosLogin: LoginInput,
  ): Promise<AuthPayload> {
      const payloadLogin = await this.authService.login(dadosLogin);
      return payloadLogin;
  }
  // --- FIM MUTATIONS ---


  @Query(() => UserOutput, { name: 'meuPerfil', description: 'Retorna os dados do usuário logado (requer token).' })
  @UseGuards(JwtAuthGuard)
  meuPerfil(
    @CurrentUser() usuario: UserEntity,
    // @Context() context: any // Pode descomentar se precisar inspecionar o contexto GQL
  ): UserOutput {
    // --- LOGS DE DEBUG ADICIONAIS ---
    this.logger.debug(`[Resolver meuPerfil] Query acessada.`); // Log geral de entrada
    // this.logger.verbose(`[Resolver meuPerfil] Contexto GQL Keys: ${JSON.stringify(Object.keys(context || {}))}`); // Log opcional do contexto
    this.logger.debug(`[Resolver meuPerfil] Usuário recebido via @CurrentUser: ${usuario?.email} (ID: ${usuario?.id})`);
    this.logger.verbose(`[Resolver meuPerfil] Objeto Usuário completo injetado: ${JSON.stringify(usuario)}`); // Log opcional do objeto completo
    // -------------------------------

    if (!usuario) {
         this.logger.error('[Resolver meuPerfil] CurrentUser decorator retornou undefined mesmo após JwtAuthGuard.');
         throw new InternalServerErrorException('Erro interno ao obter dados do usuário logado.');
    }

    // Mapeia entidade para DTO de saída
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        criadoEm: usuario.criadoEm
    };
  }
}