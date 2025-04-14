import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('usuarios') // Nome da tabela será "usuarios"
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') // Chave primária como UUID
  id: string;

  @Column({ length: 100, nullable: false }) // Nome obrigatório
  nome: string;

  @Index({ unique: true }) // Cria um índice único para performance e garantia
  @Column({ length: 100, unique: true, nullable: false }) // Email único e obrigatório
  email: string;

  // Coluna para o HASH da senha
  @Column({
      name: 'password_hash', // Nome da coluna no banco
      type: 'varchar',       // Tipo explícito para garantir compatibilidade
      length: 255,           // Tamanho suficiente para hashes bcrypt
      nullable: false,       // Hash é obrigatório
      select: false          // NÃO SELECIONAR por padrão em queries normais
  })
  passwordHash: string; // Propriedade na classe

  // Timestamps automáticos
  @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  atualizadoEm: Date;

  // Adicionar relacionamentos (ex: com Pedidos) depois, se necessário
}