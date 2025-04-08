import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProdutoEntity } from './produto.entity';

@Entity('categorias') // Nome da tabela no banco
export class CategoriaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100, unique: true })
  nome: string;

  @Column({ length: 100, unique: true })
  slug: string; // Ex: 'skates-completos'

  @Column('text', { nullable: true })
  descricao: string | null;

  // Relacionamento Inverso: Uma categoria tem muitos produtos
  @OneToMany(() => ProdutoEntity, (produto) => produto.categoria)
  produtos: ProdutoEntity[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  atualizadoEm: Date;
}