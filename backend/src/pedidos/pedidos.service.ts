// radical/backend/src/pedidos/pedidos.service.ts
import {
  Injectable, NotFoundException, Inject, forwardRef,
  InternalServerErrorException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { PedidoEntity } from '../database/entities/pedidos.entity';
import { ItemPedidoEntity } from '../database/entities/item-pedido.entity';
import { OrderStatus } from '../database/entities/pedidos.entity';
import { CarrinhoService } from './carrinho.service';
import { ProdutosService } from '../produtos/produtos.service';
import { PagamentosService } from '../pagamentos/pagamentos.service';
import { UserEntity } from '../database/entities/user.entity';
import { EnderecoInput } from './dto/endereco.input';
import { ProdutoEntity } from '../database/entities/produto.entity'; // Já importado, ótimo!

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(PedidoEntity)
    private readonly pedidoRepository: Repository<PedidoEntity>,
    private readonly carrinhoService: CarrinhoService,
    @Inject(forwardRef(() => ProdutosService))
    private readonly produtosService: ProdutosService,
    @Inject(forwardRef(() => PagamentosService))
    private readonly pagamentosService: PagamentosService,
    private readonly dataSource: DataSource,
  ) {}

  async criarPedido(usuario: UserEntity, dadosEndereco: EnderecoInput): Promise<PedidoEntity> {
    const carrinho = await this.carrinhoService.obterCarrinhoPorUsuario(usuario);
    if (!carrinho || !carrinho.itens || carrinho.itens.length === 0) {
      throw new BadRequestException('Seu carrinho de compras está vazio.');
    }

    return await this.dataSource.transaction<PedidoEntity>(async (manager: EntityManager): Promise<PedidoEntity> => {
        const itensPedidoParaSalvar: Partial<ItemPedidoEntity>[] = [];
        let valorTotalPedido = 0;

        for (const itemCarrinho of carrinho.itens) {
            // Você pode continuar usando o serviço para verificar o estoque,
            // passando o manager para ele garantir a leitura transacional.
            const estoqueSuficiente = await this.produtosService.verificarDisponibilidadeEstoque(itemCarrinho.produtoId, itemCarrinho.quantidade, manager);
            if (!estoqueSuficiente) throw new BadRequestException(`Estoque insuficiente para o produto ID ${itemCarrinho.produtoId}.`);

            // --- CORREÇÃO AQUI (Linha 51 approx): Usar o manager diretamente ---
            // Em vez de: const produtoInfo = await this.produtosService.findOne(itemCarrinho.produtoId, manager);
            // Use:
            const produtoInfo = await manager.findOne(ProdutoEntity, { where: { id: itemCarrinho.produtoId } });
            // --- FIM DA CORREÇÃO ---

            if (!produtoInfo) {
                // Se a verificação de estoque passou mas o findOne falhou, algo muito estranho aconteceu
                console.error(`Inconsistência: Produto ${itemCarrinho.produtoId} tinha estoque mas não foi encontrado na transação.`);
                throw new NotFoundException(`Produto ID ${itemCarrinho.produtoId} não encontrado durante a criação do pedido.`);
            }

            itensPedidoParaSalvar.push({
              produtoId: itemCarrinho.produtoId,
              nomeProduto: produtoInfo.nome,
              skuProduto: produtoInfo.sku,
              quantidade: itemCarrinho.quantidade,
              precoUnitarioCompra: itemCarrinho.precoUnitarioRegistrado,
            });
            valorTotalPedido += itemCarrinho.quantidade * Number(itemCarrinho.precoUnitarioRegistrado);
        }

        // 2. Criar o Pedido principal (código restante sem alteração aparente)
        const novoPedido = manager.create(PedidoEntity, {
          usuarioId: usuario.id,
          valorTotal: valorTotalPedido,
          status: OrderStatus.PENDING,
          enderecoEntrega: dadosEndereco.entrega,
          enderecoFaturamento: dadosEndereco.faturamento ?? dadosEndereco.entrega,
          itens: itensPedidoParaSalvar.map(itemData => manager.create(ItemPedidoEntity, itemData)),
        });
        const pedidoSalvo = await manager.save(PedidoEntity, novoPedido);

        // 3. Reduzir o estoque dos produtos (código restante sem alteração aparente)
        for (const item of pedidoSalvo.itens) {
            if(item.produtoId) {
              // reduzirEstoque já recebe o manager, está correto
              await this.produtosService.reduzirEstoque(item.produtoId, item.quantidade, manager);
            } else {
              console.warn(`Item ${item.id} do pedido ${pedidoSalvo.id} não possui produtoId, estoque não reduzido.`);
            }
        }

        console.log(`Pedido ${pedidoSalvo.id} criado com sucesso na transação.`);
        return pedidoSalvo;

    }).then(async (pedidoSalvo: PedidoEntity) => {
        // Bloco pós-commit (código restante sem alteração aparente)
        try {
            await this.carrinhoService.limparCarrinho(carrinho); // Passar o carrinho original
            console.log(`Carrinho do usuário ${usuario.id} limpo após pedido ${pedidoSalvo.id}.`);
        } catch (errorLimpeza) {
            console.error(`Falha ao limpar carrinho após pedido ${pedidoSalvo.id}:`, errorLimpeza);
        }

        console.log(`Iniciando chamada para simulação de pagamento do pedido ${pedidoSalvo.id}.`);
        try {
            await this.pagamentosService.simularProcessamentoPagamento(pedidoSalvo.id, pedidoSalvo.valorTotal);
        } catch (errorPagamento) {
            console.error(`Erro ao chamar simulação de pagamento para pedido ${pedidoSalvo.id}. O pedido permanece PENDENTE. Erro:`, errorPagamento);
        }

        console.log(`Recarregando pedido ${pedidoSalvo.id} para retorno.`);
        // Usar findOne do repositório principal aqui, fora da transação
        const pedidoFinal = await this.pedidoRepository.findOne({
            where: { id: pedidoSalvo.id },
            relations: ['itens', 'usuario'], // Ajuste as relações conforme necessário
        });
         if (!pedidoFinal) {
             // Isso seria muito inesperado
             console.error(`Falha CRÍTICA: Pedido ${pedidoSalvo.id} não encontrado após criação e commit.`);
             throw new InternalServerErrorException(`Erro ao buscar detalhes do pedido recém-criado.`);
         }
         return pedidoFinal;

    }).catch(error => {
        // Bloco catch da transação (código restante sem alteração aparente)
        console.error("Erro durante a transação de criação do pedido:", error);
        if (error instanceof BadRequestException || error instanceof NotFoundException) {
            throw error;
        }
        throw new InternalServerErrorException('Não foi possível processar seu pedido. Por favor, tente novamente.');
    });
  }

  // --- Métodos restantes (atualizarStatusPedido, buscarPedidoPorId, buscarPedidosPorUsuario) sem alterações ---
  async atualizarStatusPedido(pedidoId: string, status: OrderStatus): Promise<PedidoEntity> {
    const resultado = await this.pedidoRepository.update({ id: pedidoId }, { status: status });
    if (resultado.affected === 0) {
        throw new NotFoundException(`Pedido com ID ${pedidoId} não encontrado para atualização de status.`);
    }
    console.log(`[PedidosService] Status do pedido ${pedidoId} atualizado para ${status}.`);
    // findOneByOrFail não aceita relations, usar findOneOrFail
    return await this.pedidoRepository.findOneOrFail({ where: { id: pedidoId }, relations: ['itens', 'usuario']}); // Adicione relations se necessário
  }

  async buscarPedidoPorId(id: string, usuarioId?: string): Promise<PedidoEntity | null> {
    const whereCondition: any = { id: id };
    if (usuarioId) {
        whereCondition.usuarioId = usuarioId;
    }
    // findOne pode retornar null
    const pedido = await this.pedidoRepository.findOne({ where: whereCondition, relations: ['itens', 'usuario'] });
    if (!pedido) {
        // Lança erro apenas se não encontrar, como antes
        if (usuarioId) {
             throw new NotFoundException(`Pedido com ID ${id} não encontrado ou não pertence a este usuário.`);
        } else {
             throw new NotFoundException(`Pedido com ID ${id} não encontrado.`);
        }
    }
    return pedido;
  }

  async buscarPedidosPorUsuario(usuario: UserEntity): Promise<PedidoEntity[]> {
    return this.pedidoRepository.find({
      where: { usuarioId: usuario.id },
      relations: ['itens'],
      order: { criadoEm: 'DESC' },
    });
  }

} // Fim da classe PedidosService