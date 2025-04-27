// radical/backend/src/pedidos/pedidos.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql'; // Adicionar Mutation, Args
import { PedidosService } from './pedidos.service';
import { PedidoOutput } from './dto/pedido.output'; // <<< Importar DTO de saída
import { EnderecoInput } from './dto/endereco.input'; // <<< Importar DTO de entrada
import { UseGuards, ParseUUIDPipe } from '@nestjs/common'; // <<< Importar UseGuards
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // <<< Importar Guarda
import { CurrentUser } from '../auth/decorators/current-user.decorator'; // <<< Importar Decorator
import { UserEntity } from '../database/entities/user.entity'; // <<< Importar Entidade User
import { PedidoEntity } from '../database/entities/pedidos.entity'; // Importar Entidade Pedido

@Resolver(() => PedidoOutput) // Resolver principal opera sobre PedidoOutput
export class PedidosResolver {
  constructor(private readonly pedidosService: PedidosService) {}

  // --- Queries existentes (buscarPedidoPorId, buscarPedidosPorUsuario) ---
  @Query(() => PedidoOutput, { name: 'pedidoPorId', nullable: true })
  @UseGuards(JwtAuthGuard) // Proteger queries de pedidos
  async buscarPedidoPorId(
    // Usar ParseUUIDPipe para validar formato do ID
    @Args('id', { type: () => ID }, new ParseUUIDPipe()) id: string,
    @CurrentUser() usuario: UserEntity, // Pegar usuário logado
  ): Promise<PedidoEntity | null> { // <<< Retorna Entidade (ou null)
    // Passa o ID do usuário para o serviço verificar permissão
    return this.pedidosService.buscarPedidoPorId(id, usuario.id);
  }

  @Query(() => [PedidoOutput], { name: 'meusPedidos' })
  @UseGuards(JwtAuthGuard) // Proteger
  async buscarMeusPedidos(
    @CurrentUser() usuario: UserEntity, // Pegar usuário logado
  ): Promise<PedidoEntity[]> { // <<< Retorna Array de Entidades
    return this.pedidosService.buscarPedidosPorUsuario(usuario);
  }

  // --- NOVA MUTATION: criarPedido ---
  @Mutation(() => PedidoOutput, { name: 'criarPedido' })
  @UseGuards(JwtAuthGuard) // Apenas usuários logados podem criar pedidos
  async criarPedido(
    @CurrentUser() usuario: UserEntity, // Pega o usuário logado automaticamente
    @Args('endereco', { type: () => EnderecoInput }) endereco: EnderecoInput, // Pega os dados do endereço do input da mutation
  ): Promise<PedidoEntity> { // <<< Retorna a Entidade Pedido criada
    // Chama o método do serviço que faz todo o trabalho pesado
    // O serviço deve retornar a entidade PedidoEntity salva
    const pedidoCriado = await this.pedidosService.criarPedido(usuario, endereco);
    // O NestJS/GraphQL automaticamente mapeará a PedidoEntity retornada
    // para o PedidoOutput, usando os @Field dos DTOs (e ResolveFields, se houver)
    return pedidoCriado;
  }
  // --- FIM NOVA MUTATION ---

  // TODO: Adicionar ResolveField para o campo 'usuario' do PedidoOutput se necessário
  /* Exemplo:
  @ResolveField('usuario', () => UserOutput)
  async getUsuario(@Parent() pedido: PedidoEntity): Promise<UserOutput> {
      // Se o usuário não for carregado por padrão ('relations: ['usuario']' no serviço)
      // precisaria buscar aqui. Assumindo que foi carregado:
      if (!pedido.usuario) {
           // Buscar this.usersService.findById(pedido.usuarioId) ou similar
           throw new InternalServerErrorException('Usuário não carregado para o pedido');
      }
      // Mapear Entity para Output (se necessário, ou retornar direto se compatível)
      return { id: pedido.usuario.id, email: pedido.usuario.email, nome: pedido.usuario.nome };
  }
  */

} // Fim da classe PedidosResolver