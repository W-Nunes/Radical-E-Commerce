import { ObjectType, Field, ID, Float, GraphQLISODateTime } from '@nestjs/graphql'; // Importar GraphQLISODateTime para datas
import { OrderStatus } from '../../database/entities/pedidos.entity';
import { UserOutput } from '../../auth/dto/user.output';
import { ItemPedidoType } from './item-pedido.output'; 
import { EnderecoOutput } from './endereco.output'; 


@ObjectType('Pedido')
export class PedidoOutput {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  valorTotal: number;

  @Field(() => OrderStatus) 
  status: OrderStatus;


  @Field(() => EnderecoOutput) 
  enderecoEntrega: EnderecoOutput; 

  @Field(() => EnderecoOutput, { nullable: true }) 
  enderecoFaturamento?: EnderecoOutput; 

  @Field(() => [ItemPedidoType])
  itens: ItemPedidoType[];

  @Field(() => UserOutput) 
  usuario: UserOutput;

  @Field(() => GraphQLISODateTime)
  criadoEm: Date; 

  @Field(() => GraphQLISODateTime)
  atualizadoEm: Date; 
}