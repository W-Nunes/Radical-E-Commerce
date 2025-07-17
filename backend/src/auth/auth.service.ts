import { Injectable, UnauthorizedException, Logger, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm'; 
import { Repository } from 'typeorm'; 
import { UserEntity } from '../database/entities/user.entity'; 
import { RegistroInput } from './dto/registro.input';
import { LoginInput } from './dto/login.input';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { AuthPayload } from './dto/auth.payload';
import { UserOutput } from './dto/user.output';

@Injectable()
export class AuthService {
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

        const novoUsuario = this.userRepository.create({ nome, email, passwordHash });

        try {
            await this.userRepository.save(novoUsuario);
            this.logger.verbose(`[registrar] Usuário ${email} registrado com sucesso com ID: ${novoUsuario.id}.`);
            const { passwordHash: _, ...usuarioSeguro } = novoUsuario;
            return usuarioSeguro;
        } catch (error) {
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
         const usuario = await this.userRepository
                                .createQueryBuilder('user')
                                .addSelect('user.passwordHash') 
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
                return resultado;
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
        const usuarioValidado = await this.validarUsuario(email, password); 

        if (!usuarioValidado) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const payload: JwtPayload = {
             id: usuarioValidado.id,
             sub: usuarioValidado.id,
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

    // Adicionar/Confirmar método encontrarUsuarioPorId para a Strategy
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