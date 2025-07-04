// radical/backend/src/auth/auth.service.ts
import { randomBytes } from 'crypto';
import { Injectable, UnauthorizedException, Logger, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm'; // <<< 1. Importar InjectRepository
import { Repository } from 'typeorm'; // <<< 2. Importar Repository
import { UserEntity } from '../database/entities/user.entity'; // <<< 3. Importar UserEntity
import { RegistroInput } from './dto/registro.input';
import { LoginInput } from './dto/login.input';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthPayload } from './dto/auth.payload';
import { UserOutput } from './dto/user.output';

// Removido UsersService e MockUser

@Injectable()
export class AuthService {
    // Usar logger com contexto do projeto principal
    private logger = new Logger('AuthService');

    constructor(
        // <<< 4. Injetar o repositório UserEntity
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        // Removida injeção do UsersService (mock)
    ) {}

    async registrar(dadosRegistro: RegistroInput): Promise<Omit<UserEntity, 'passwordHash'>> {
        const { nome, email, password } = dadosRegistro;
        const saltRounds = 10;

        this.logger.debug(`[registrar] Gerando hash para senha do usuário ${email}...`);
        const passwordHash = await bcrypt.hash(password, saltRounds);
        this.logger.debug(`[registrar] Hash gerado para ${email}: ${passwordHash.substring(0, 10)}...`);

        // <<< 5. Usar userRepository para criar e salvar
        const novoUsuario = this.userRepository.create({ nome, email, passwordHash });

        try {
            await this.userRepository.save(novoUsuario);
            this.logger.verbose(`[registrar] Usuário ${email} registrado com sucesso com ID: ${novoUsuario.id}.`);
            // Retornar usuário sem o hash
            const { passwordHash: _, ...usuarioSeguro } = novoUsuario;
            return usuarioSeguro;
        } catch (error) {
            // Tratamento de erro de constraint (ex: email único)
            if (error.code === '23505') {
                this.logger.warn(`[registrar] Tentativa de registro com email duplicado: ${email}`);
                throw new ConflictException('Este endereço de e-mail já está em uso.');
            } else {
                this.logger.error(`[registrar] Falha ao registrar usuário ${email}`, error.stack);
                throw new InternalServerErrorException('Erro ao registrar usuário.');
            }
        }
    }

    async validarUsuario(email: string, pass: string): Promise<Omit<UserEntity, 'passwordHash'> | null> {
        this.logger.debug(`[validarUsuario] Tentando validar usuário: ${email}`);

        // <<< 6. Usar QueryBuilder (ou findOne) para buscar usuário E hash
        // Usando QueryBuilder como no seu serviço original para garantir seleção do hash
         const usuario = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.passwordHash') // Garante que o hash venha
                                .where('user.email = :email', { email })
                                .getOne();

        this.logger.debug(`[validarUsuario] Usuário encontrado no DB para ${email}: ${!!usuario}`);
        if (!usuario) {
            this.logger.warn(`[validarUsuario] Usuário com email ${email} não encontrado no banco.`);
            return null;
        }
        this.logger.debug(`[validarUsuario] Hash recuperado do DB para ${email}: ${usuario.passwordHash ? usuario.passwordHash.substring(0, 10) + '...' : 'NULO/UNDEFINED!'}`);


        if (pass && usuario.passwordHash) {
            this.logger.debug(`[validarUsuario] Comparando senha recebida com hash do DB...`);
            const isMatch = await bcrypt.compare(pass, usuario.passwordHash);
            this.logger.debug(`[validarUsuario] Resultado bcrypt para ${email}: ${isMatch}`);

            if (isMatch) {
                this.logger.debug(`[validarUsuario] Senha válida para ${email}. Retornando usuário sem hash.`);
                const { passwordHash: _, ...resultado } = usuario;
                return resultado; // Retorna UserEntity sem o hash
            } else {
                 this.logger.warn(`[validarUsuario] Comparação de senha falhou para ${email}.`);
            }
        } else {
            this.logger.error(`[validarUsuario] Argumentos faltando para bcrypt.compare (senha ou hash ausentes).`);
        }

        this.logger.warn(`[validarUsuario] Validação final falhou para ${email}. Retornando null.`);
        return null;
    }


    async login(dadosLogin: LoginInput): Promise<AuthPayload> {
        const { email, password } = dadosLogin;
        this.logger.debug(`[login] Iniciando processo de login para ${email}`);
        const usuarioValidado = await this.validarUsuario(email, password); // Chama o validarUsuario adaptado

        if (!usuarioValidado) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const payload: JwtPayload = {
             id: usuarioValidado.id,
             sub: usuarioValidado.id, // Adicionar sub também é uma boa prática
             email: usuarioValidado.email
        };
        this.logger.debug(`[login] Payload JWT criado: ${JSON.stringify(payload)}`);

        const accessToken = this.jwtService.sign(payload);
        this.logger.verbose(`[login] Usuário ${email} logado com sucesso. Token gerado.`);

        // Mapeia UserEntity para UserOutput
        const usuarioOutput: UserOutput = {
            id: usuarioValidado.id,
            nome: usuarioValidado.nome,
            email: usuarioValidado.email,
            criadoEm: usuarioValidado.criadoEm,
        };

        return { accessToken, usuario: usuarioOutput };
    }

    // <<< 7. Adicionar/Confirmar método encontrarUsuarioPorId para a Strategy
    async encontrarUsuarioPorId(id: string): Promise<UserEntity | null> {
        this.logger.debug(`[encontrarUsuarioPorId] Buscando usuário por ID (da Strategy): ${id}`);
        const usuario = await this.userRepository.findOneBy({ id });
        if (!usuario) {
             this.logger.warn(`[encontrarUsuarioPorId] Usuário com ID ${id} não encontrado.`);
             return null;
        }
         this.logger.debug(`[encontrarUsuarioPorId] Usuário encontrado: ${usuario.email}`);
        return usuario;
    }
}