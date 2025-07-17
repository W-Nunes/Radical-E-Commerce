import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity'; 
import { ItemCarrinho } from './item-carrinho.entity';

@Entity({ name: 'carrinhos'}) 
export class Carrinho {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string; 

  @ManyToOne(() => UserEntity )
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity ;

  @OneToMany(() => ItemCarrinho, item => item.carrinho, { cascade: true, eager: true }) 
  itens: ItemCarrinho[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone' })
  atualizadoEm: Date;
}