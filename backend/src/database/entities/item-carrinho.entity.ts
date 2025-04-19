import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { ProdutoEntity } from './produto.entity'; // <-- Importar entidade Produto

@Entity({ name: 'itens_carrinho' })
export class ItemCarrinho {
  @PrimaryGeneratedColumn('increment') // <-- Usar 'increment' se for numérico auto-incrementável
  id: number;

  @Column({ name: 'carrinho_id', type: 'uuid' }) // <-- Especificar tipo UUID
  carrinhoId: string; // UUID

  @ManyToOne(() => Carrinho, carrinho => carrinho.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrinho_id' })
  carrinho: Carrinho;

  @Column({ name: 'produto_id', type: 'uuid' }) // <-- Especificar tipo UUID (se for o caso)
  produtoId: string; // Ou o tipo do ID do seu produto

  // --- Relação explícita com Produto (sem eager loading) ---
  @ManyToOne(() => ProdutoEntity, { nullable: true, onDelete: 'SET NULL' }) // Permite produto nulo se for deletado, ou ajuste conforme regra de negócio
  @JoinColumn({ name: 'produto_id' }) // Junta pela coluna produto_id
  produto: ProdutoEntity; // Apenas a definição da relação, sem carregar automaticamente
  // --- Fim da adição da relação explícita ---

  @Column()
  quantidade: number;

  @Column({ name: 'preco_unitario_registrado', type: 'numeric', precision: 10, scale: 2 })
  precoUnitarioRegistrado: number; // Preço no momento da adição

  @CreateDateColumn({ name: 'adicionado_em', type: 'timestamp with time zone' })
  adicionadoEm: Date;
}