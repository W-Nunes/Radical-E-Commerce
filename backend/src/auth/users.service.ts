import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';


export interface MockUser {
  id: string;
  nome: string;
  email: string;
  passwordHash: string;
  criadoEm: Date;
}

@Injectable()
export class UsersService {
  private readonly users: MockUser[] = [];

  async findOneByEmail(email: string): Promise<MockUser | undefined> {
    console.log(`[MockUsersService] Buscando usuário por email: ${email}`);
    return this.users.find(user => user.email === email);
  }

  async findOneById(id: string): Promise<MockUser | undefined> {
     console.log(`[MockUsersService] Buscando usuário por ID: ${id}`);
    return this.users.find(user => user.id === id);
  }

  async createUser(dadosRegistro: any): Promise<MockUser> {
    console.log(`[MockUsersService] Tentando criar usuário: ${dadosRegistro.email}`);
    const existe = await this.findOneByEmail(dadosRegistro.email);
    if (existe) {
      throw new ConflictException(`Email ${dadosRegistro.email} já está em uso.`);
    }

    const id = crypto.randomUUID();
    const saltRounds = 10;
    const hash = await bcrypt.hash(dadosRegistro.password, saltRounds);

    const novoUsuario: MockUser = {
      id: id,
      nome: dadosRegistro.nome,
      email: dadosRegistro.email,
      passwordHash: hash,
      criadoEm: new Date(),
    };
    this.users.push(novoUsuario);
    console.log(`[MockUsersService] Usuário ${novoUsuario.email} criado com ID: ${id}`);
    return novoUsuario;
  }
}