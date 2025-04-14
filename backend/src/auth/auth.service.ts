import { Injectable, UnauthorizedException, Logger, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config'; // Importar se for usar para salt rounds, etc.

import { UserEntity } from '../database/entities/user.entity';
import { RegistroInput } from './dto/registro.input';
import { LoginInput } from './dto/login.input';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthPayload } from './dto/auth.payload';
import { UserOutput } from './dto/user.output'; // Para mapear o retorno do login


@Injectable()
export class AuthService {
    private logger = new Logger('AuthService');

    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        // private readonly configService: ConfigService, // Injetar se usar
    ) {}

    /**
     * Registra um novo usuário.
     */
    async registrar(dadosRegistro: RegistroInput): Promise<Omit<UserEntity, 'passwordHash'>> {
        const { nome, email, password } = dadosRegistro;
        const saltRounds = 10; // Ou buscar de configService

        this.logger.debug(`[registrar] Gerando hash para senha do usuário ${email}...`);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        this.logger.debug(`[registrar] Hash gerado para ${email}: ${passwordHash.substring(0, 10)}...`);

        const novoUsuario = this.userRepository.create({ nome, email, passwordHash });

        try {
            await this.userRepository.save(novoUsuario);
            this.logger.verbose(`[registrar] Usuário ${email} registrado com sucesso com ID: ${novoUsuario.id}.`);
            const { passwordHash: _, ...usuarioSeguro } = novoUsuario;
            return usuarioSeguro;
        } catch (error) {
            if (error.code === '23505') { // Unique violation (email)
                this.logger.warn(`[registrar] Tentativa de registro com email duplicado: ${email}`);
                throw new ConflictException('Este endereço de e-mail já está em uso.');
            } else {
                this.logger.error(`[registrar] Falha ao registrar usuário ${email}`, error.stack);
                throw new InternalServerErrorException('Erro ao registrar usuário.');
            }
        }
    }

    /**
     * Valida o usuário para login.
     */
    async validarUsuario(email: string, pass: string): Promise<Omit<UserEntity, 'passwordHash'> | null> {
        this.logger.debug(`[validarUsuario] Tentando validar usuário: ${email}`);
        // Usar QueryBuilder para garantir seleção do hash
        const usuario = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.passwordHash')
                                .where('user.email = :email', { email })
                                .getOne();

        this.logger.debug(`[validarUsuario] Usuário encontrado no DB para ${email}: ${!!usuario}`);
        if (usuario) {
             this.logger.debug(`[validarUsuario] Hash recuperado do DB para ${email}: ${usuario.passwordHash ? usuario.passwordHash.substring(0, 10) + '...' : 'NULO ou UNDEFINED!'}`);
             this.logger.debug(`[validarUsuario] Senha recebida para comparação: [${pass}]`);
        } else {
             this.logger.warn(`[validarUsuario] Usuário com email ${email} não encontrado no banco.`);
             return null;
        }

        if (pass && usuario.passwordHash) {
            this.logger.debug(`[validarUsuario] Comparando senha [<span class="math-inline">\{pass\}\] com hash \[</span>{usuario.passwordHash.substring(0,10)}...] usando bcrypt...`);
            const isMatch = await bcrypt.compare(pass, usuario.passwordHash);
            this.logger.debug(`[validarUsuario] Resultado da comparação bcrypt para ${email}: ${isMatch}`);

            if (isMatch) {
                this.logger.debug(`[validarUsuario] Senha válida para ${email}. Retornando usuário sem hash.`);
                const { passwordHash, ...resultado } = usuario;
                return resultado;
            } else {
                this.logger.warn(`[validarUsuario] Comparação de senha falhou para ${email}.`);
            }
        } else {
             this.logger.error(`[validarUsuario] Argumentos faltando para bcrypt.compare: pass=<span class="math-inline">\{\!\!pass\}, hash\=</span>{!!usuario.passwordHash}.`);
        }

        this.logger.warn(`[validarUsuario] Validação final falhou para ${email}. Retornando null.`);
        return null;
    }


    /**
     * Realiza o login.
     */
    async login(dadosLogin: LoginInput): Promise<AuthPayload> {
        const { email, password } = dadosLogin;
        this.logger.debug(`[login] Iniciando processo de login para ${email}`);
        const usuarioValidado = await this.validarUsuario(email, password); // Retorna sem hash

        if (!usuarioValidado) {
            // Log já acontece em validarUsuario
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        // Cria o payload para o token JWT
        const payload: JwtPayload = { id: usuarioValidado.id, email: usuarioValidado.email };

        // Logar o segredo usado para assinar (opcional, remover em prod)
        // const segredoUsadoParaAssinar = this.configService.get<string>('JWT_SECRET');
        // this.logger.debug(`[login] Segredo JWT usado para ASSINAR o token: ${segredoUsadoParaAssinar ? segredoUsadoParaAssinar.substring(0, 5) + '...' : 'NÃO ENCONTRADO!'}`);

        // Gera o token
        const accessToken = this.jwtService.sign(payload);
        this.logger.verbose(`[login] Usuário ${email} logado com sucesso. Token gerado.`);

        // Mapeia para UserOutput para retornar dados seguros
        const usuarioOutput: UserOutput = {
            id: usuarioValidado.id,
            nome: usuarioValidado.nome,
            email: usuarioValidado.email,
            criadoEm: usuarioValidado.criadoEm,
            // Adicionar outros campos seguros se houver no UserOutput/UserEntity
        };

        return { accessToken, usuario: usuarioOutput };
    }

     /**
      * Busca usuário por ID (usado pela JwtStrategy).
      */
     async encontrarUsuarioPorId(id: string): Promise<UserEntity | null> {
        this.logger.debug(`[encontrarUsuarioPorId] Buscando usuário por ID (da Strategy): ${id}`);
        const usuario = await this.userRepository.findOneBy({ id });
        this.logger.debug(`[encontrarUsuarioPorId] Resultado da busca por ID ${id}: ${!!usuario ? `Encontrado (${usuario.email})` : 'NÃO Encontrado'}`);
        return usuario;
    }
}