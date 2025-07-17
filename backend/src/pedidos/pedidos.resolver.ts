import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'; // Adicionar Mutation, Args
import { PedidosService } from './pedidos.service';
import { PedidoOutput } from './dto/pedido.output'; // <<< Importar DTO de saída
import { EnderecoInput } from './dto/endereco.input'; // <<< Importar DTO de entrada
import { UseGuards, ParseUUIDPipe } from '@nestjs/common'; // <<< Importar UseGuards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // <<< Importar Guarda
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // <<< Importar Decorator
import { UserEntity } from '../database/entities/user.entity'; // <<< Importar Entidade User
import { PedidoEntity } from '../database/entities/pedidos.entity'; // Importar Entidade Pedido

@Resolver(() => PedidoOutput) 
export class PedidosResolver {
  constructor(private readonly pedidosService: PedidosService) {}


  @Query(() => PedidoOutput, { name: 'pedidoPorId', nullable: true })
  @UseGuards(JwtAuthGuard) 
  async buscarPedidoPorId(
    @Args('id', { type: () => ID }, new ParseUUIDPipe()) id: string,
    @CurrentUser() usuario: UserEntity, 
  ): Promise<PedidoEntity | null> { 
    return this.pedidosService.buscarPedidoPorId(id, usuario.id);
  }

  @Query(() => [PedidoOutput], { name: 'meusPedidos' })
  @UseGuards(JwtAuthGuard) 
  async buscarMeusPedidos(
    @CurrentUser() usuario: UserEntity,
  ): Promise<PedidoEntity[]> { 
    return this.pedidosService.buscarPedidosPorUsuario(usuario);
  }

  @Mutation(() => PedidoOutput, { name: 'criarPedido' })
  @UseGuards(JwtAuthGuard) 
  async criarPedido(
    @CurrentUser() usuario: UserEntity, 
    @Args('endereco', { type: () => EnderecoInput }) endereco: EnderecoInput, 
  ): Promise<PedidoEntity> { 
    const pedidoCriado = await this.pedidosService.criarPedido(usuario, endereco);
    return pedidoCriado;
  }

} 