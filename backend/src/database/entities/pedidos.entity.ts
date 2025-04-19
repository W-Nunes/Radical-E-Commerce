// radical/backend/src/database/entities/pedidos.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ItemPedidoEntity } from './item-pedido.entity'; // <-- Atualizar import

// Enum para o status do pedido
export enum OrderStatus {
    PENDING = 'PENDENTE',
    PROCESSING = 'PROCESSANDO',
    PAID = 'PAGO', // <-- Adicionado
    SHIPPED = 'ENVIADO',
    DELIVERED = 'ENTREGUE',
    CANCELED = 'CANCELADO',
    FAILED = 'FALHOU',
}

@Entity('pedidos')
export class PedidoEntity { // <-- Renomeado para PedidoEntity
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, { nullable: false, eager: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario: UserEntity;

    @Column({ name: 'usuario_id', type: 'uuid'}) // Explicit type
    usuarioId: string;

    // Atualizar tipo para ItemPedidoEntity
    @OneToMany(() => ItemPedidoEntity, (item) => item.pedido, { cascade: ['insert'], eager: true })
    itens: ItemPedidoEntity[]; // <-- Atualizado tipo

    @Column('decimal', { name: 'valor_total', precision: 10, scale: 2 })
    valorTotal: number;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Column('jsonb', { name: 'endereco_entrega', nullable: true })
    enderecoEntrega: object | null;

    // Renomeado para faturamento para consistência com DTO
    @Column('jsonb', { name: 'endereco_faturamento', nullable: true })
    enderecoFaturamento: object | null; // <-- Renomeado

    @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone' })
    atualizadoEm: Date;
}