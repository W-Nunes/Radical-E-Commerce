// radical/backend/src/database/entities/pedidos.entity.ts
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
// --- ADICIONAR IMPORTAÇÃO ---
import { registerEnumType } from '@nestjs/graphql';
// --- FIM ADIÇÃO ---
import { UserEntity } from './user.entity';
import { ItemPedidoEntity } from './item-pedido.entity';

// Enum para o status do pedido
export enum OrderStatus {
    PENDING = 'PENDENTE',
    PROCESSING = 'PROCESSANDO',
    PAID = 'PAGO',
    SHIPPED = 'ENVIADO',
    DELIVERED = 'ENTREGUE',
    CANCELED = 'CANCELADO',
    FAILED = 'FALHOU',
}

// --- ADICIONAR REGISTRO AQUI ---
registerEnumType(OrderStatus, {
  name: 'OrderStatus', // Este será o nome do tipo Enum no schema GraphQL
  description: 'Os possíveis status de um pedido no sistema.', // Descrição opcional
});
// --- FIM DO REGISTRO ---


@Entity('pedidos')
export class PedidoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserEntity, { nullable: false, eager: false })
    @JoinColumn({ name: 'usuario_id' })
    usuario: UserEntity;

    @Column({ name: 'usuario_id', type: 'uuid'})
    usuarioId: string;

    @OneToMany(() => ItemPedidoEntity, (item) => item.pedido, { cascade: ['insert'], eager: true })
    itens: ItemPedidoEntity[];

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

    @Column('jsonb', { name: 'endereco_faturamento', nullable: true })
    enderecoFaturamento: object | null;

    @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone' })
    criadoEm: Date;

    @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone' })
    atualizadoEm: Date;
}