import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity'; // Ajuste o caminho se necessário
import { ItemCarrinho } from './item-carrinho.entity';

@Entity({ name: 'carrinhos'}) // Definindo schema 'pedidos'
export class Carrinho {
  @PrimaryGeneratedColumn('uuid') // Usar UUID é uma boa prática
  id: string;

  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string; // Ou o tipo do ID do seu usuário

  @ManyToOne(() => UserEntity )
  @JoinColumn({ name: 'usuario_id' })
  usuario: UserEntity ;

  @OneToMany(() => ItemCarrinho, item => item.carrinho, { cascade: true, eager: true }) // Eager loading pode ser útil aqui
  itens: ItemCarrinho[];

  @CreateDateColumn({ name: 'criado_em', type: 'timestamp with time zone' })
  criadoEm: Date;

  @UpdateDateColumn({ name: 'atualizado_em', type: 'timestamp with time zone' })
  atualizadoEm: Date;
}