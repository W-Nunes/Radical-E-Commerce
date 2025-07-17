import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { PedidoEntity } from './pedidos.entity';
import { ProdutoEntity } from './produto.entity';

@Entity('itens_pedido')
export class ItemPedidoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PedidoEntity, (pedido) => pedido.itens, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'pedido_id' })
    pedido: PedidoEntity;

    @Column({ name: 'pedido_id', type: 'uuid' })
    pedidoId: string;

    @ManyToOne(() => ProdutoEntity, { nullable: true, eager: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'produto_id' })
    produto: ProdutoEntity | null;

    @Column({ name: 'produto_id', type: 'uuid', nullable: true })
    produtoId: string | null;


    @Column({ name: 'nome_produto', type: 'varchar', length: 150, nullable: true }) 
    nomeProduto: string | null;

    @Column({ name: 'sku_produto', type: 'varchar', length: 100, nullable: true })  
    skuProduto: string | null;
 

    @Column({ type: 'int' })
    quantidade: number;

    @Column('decimal', { name: 'preco_unitario_compra', precision: 10, scale: 2 })
    precoUnitarioCompra: number;
}