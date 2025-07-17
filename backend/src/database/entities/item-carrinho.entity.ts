import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Carrinho } from './carrinho.entity';
import { ProdutoEntity } from './produto.entity';

@Entity({ name: 'itens_carrinho' })
export class ItemCarrinho {
  @PrimaryGeneratedColumn('increment') 
  id: number;

  @Column({ name: 'carrinho_id', type: 'uuid' })
  carrinhoId: string;

  @ManyToOne(() => Carrinho, carrinho => carrinho.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'carrinho_id' })
  carrinho: Carrinho;

  @Column({ name: 'produto_id', type: 'uuid' }) 
  produtoId: string; 

  
  @ManyToOne(() => ProdutoEntity, { nullable: true, onDelete: 'SET NULL' }) 
  @JoinColumn({ name: 'produto_id' }) 
  produto: ProdutoEntity; 

  @Column()
  quantidade: number;

  @Column({ name: 'preco_unitario_registrado', type: 'numeric', precision: 10, scale: 2 })
  precoUnitarioRegistrado: number; 

  @CreateDateColumn({ name: 'adicionado_em', type: 'timestamp with time zone' })
  adicionadoEm: Date;
}