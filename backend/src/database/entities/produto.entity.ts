import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { CategoriaEntity } from './categoria.entity';

@Entity('produtos') // Nome da tabela no banco
export class ProdutoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  nome: string;

  @Column('text', { nullable: true })
  descricao: string | null;

  @Column('decimal', { precision: 10, scale: 2 })
  preco: number;

  @Column({ unique: true })
  sku: string; // Código único do produto

  @Column({ name: 'quantidade_estoque', type: 'int', default: 0 })
  quantidadeEstoque: number;

  @Column({ name: 'imagem_url_principal', type: 'text', nullable: true })
  imagemUrlPrincipal: string | null;

  // Relacionamento: Muitos produtos pertencem a uma categoria
  // nullable: false -> indica que a categoria é obrigatória para o produto
  @ManyToOne(() => CategoriaEntity, (categoria) => categoria.produtos, { nullable: false, eager: true }) // eager: true -> sempre carrega a categoria junto com o produto
  @JoinColumn({ name: 'categoria_id' }) // Nome da coluna da chave estrangeira
  categoria: CategoriaEntity;

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  atualizadoEm: Date;
}