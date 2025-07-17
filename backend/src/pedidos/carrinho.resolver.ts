import { Resolver, Query, Mutation, Args, Int, Float, ID, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards, NotFoundException, BadRequestException, Logger } from '@nestjs/common'; 
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '../database/entities/user.entity';
import { Carrinho } from '../database/entities/carrinho.entity';
import { ItemCarrinho } from '../database/entities/item-carrinho.entity';
import { CarrinhoService } from './carrinho.service';
import { ProdutosService } from '../produtos/produtos.service';
import { CarrinhoOutput } from './dto/carrinho.output';
import { ItemCarrinhoOutput } from './dto/item-carrinho.output';
import { ProdutoOutput } from '../produtos/dto/produto.output';
import { ProdutoEntity } from '../database/entities/produto.entity';

async function findCartOrFail(carrinhoService: CarrinhoService, usuario: UserEntity): Promise<Carrinho> {
    const carrinho = await carrinhoService.obterCarrinhoPorUsuario(usuario);
    if (!carrinho) {
        throw new NotFoundException(`Carrinho não encontrado para o usuário ${usuario.id}.`);
    }

    if (!carrinho.itens) {
        carrinho.itens = [];
    }

    return carrinho;
}

@Resolver(() => CarrinhoOutput)
@UseGuards(JwtAuthGuard)
export class CarrinhoResolver {
  private readonly logger = new Logger(CarrinhoResolver.name);
  constructor(
      private readonly carrinhoService: CarrinhoService,
      ) {}

  @Query(() => CarrinhoOutput, { name: 'meuCarrinho', nullable: true })
  async meuCarrinho(@CurrentUser() usuario: UserEntity): Promise<Carrinho | null> {
    const carrinhoEntity = await this.carrinhoService.obterCarrinhoPorUsuario(usuario);

    if (carrinhoEntity && !carrinhoEntity.itens) {
        carrinhoEntity.itens = [];
    }
    return carrinhoEntity;
  }

  @Mutation(() => CarrinhoOutput, { name: 'adicionarItemAoCarrinho' })
  async adicionarItem(
    @CurrentUser() usuario: UserEntity,
    @Args('produtoId', { type: () => ID }) produtoId: string,
    @Args('quantidade', { type: () => Int }) quantidade: number,
  ): Promise<Carrinho> {
    let carrinhoEntity = await this.carrinhoService.obterCarrinhoPorUsuario(usuario);
    carrinhoEntity = await findCartOrFail(this.carrinhoService, usuario); // Garante carrinho não nulo
    const carrinhoAtualizado = await this.carrinhoService.adicionarItemAoCarrinho(carrinhoEntity, produtoId, quantidade);
    return carrinhoAtualizado;
  }

  @Mutation(() => CarrinhoOutput, { name: 'removerItemDoCarrinho', nullable: true })
  async removerItem(
    @CurrentUser() usuario: UserEntity,
    @Args('itemCarrinhoId', { type: () => Int }) itemCarrinhoId: number,
  ): Promise<Carrinho | null> {
    const carrinhoEntity = await findCartOrFail(this.carrinhoService, usuario);
    const carrinhoAtualizado = await this.carrinhoService.removerItemDoCarrinho(carrinhoEntity, itemCarrinhoId);
    return carrinhoAtualizado;
  }

  @Mutation(() => CarrinhoOutput, { name: 'limparCarrinho', nullable: true })
  async limparCarrinho(@CurrentUser() usuario: UserEntity): Promise<Carrinho | null> {
    const carrinhoEntity = await findCartOrFail(this.carrinhoService, usuario);
    const carrinhoAtualizado = await this.carrinhoService.limparCarrinho(carrinhoEntity);
    return carrinhoAtualizado;
  }

   @Mutation(() => CarrinhoOutput, { name: 'atualizarQuantidadeItemCarrinho', nullable: true})
   async atualizarQuantidadeItem(
        @CurrentUser() usuario: UserEntity,
        @Args('itemCarrinhoId', { type: () => Int }) itemCarrinhoId: number,
        @Args('novaQuantidade', { type: () => Int }) novaQuantidade: number,
   ): Promise<Carrinho | null> {
        const carrinhoEntity = await findCartOrFail(this.carrinhoService, usuario);
        if (novaQuantidade < 1) {
            console.log(`Quantidade ${novaQuantidade} inválida para item ${itemCarrinhoId}, removendo item.`);
            return await this.carrinhoService.removerItemDoCarrinho(carrinhoEntity, itemCarrinhoId);
        }
        const carrinhoAtualizado = await this.carrinhoService.atualizarQuantidadeItem(carrinhoEntity, itemCarrinhoId, novaQuantidade);
        // Não precisa lançar erro aqui se for null, apenas retorna
        return carrinhoAtualizado;
   }
  // --- Fim das Mutations ---


  // --- RESOLVE FIELD ADICIONADO PARA O CAMPO 'total' ---
  @ResolveField('total', () => Float)
  getTotal(@Parent() carrinho: Carrinho): number {
      // @Parent() injeta a entidade Carrinho que está sendo resolvida
      this.logger.debug(`[ResolveField total] Calculando para Carrinho ID: ${carrinho.id}`);
      // Garante que carrinho.itens exista (deve ter sido tratado em findCartOrFail ou meuCarrinho)
      if (!carrinho.itens) {
          this.logger.warn(`[ResolveField total] Carrinho ID ${carrinho.id} não possui array 'itens' para cálculo.`);
          return 0; // Retorna 0 se não houver itens
      }
      // Chama a função de cálculo do serviço
      const totalCalculado = this.carrinhoService.calcularTotalCarrinho(carrinho);
      this.logger.verbose(`[ResolveField total] Total calculado para Carrinho ID ${carrinho.id}: ${totalCalculado}`);
      return totalCalculado;
  }
  // --- FIM DO RESOLVE FIELD ---

} // Fim da classe CarrinhoResolver


// --- Resolver aninhado (ItemCarrinhoResolver) - MANTIDO COMO ESTAVA ---
@Resolver(() => ItemCarrinhoOutput)
export class ItemCarrinhoResolver {
  constructor(private readonly produtosService: ProdutosService) {}

  @ResolveField('produto', () => ProdutoOutput, { nullable: true })
  async getProduto(@Parent() itemCarrinho: ItemCarrinho): Promise<ProdutoEntity | null> {
    // ... (código do getProduto mantido igual, retornando a entidade ProdutoEntity)
    console.log(`[ResolveField] Buscando produto para item ${itemCarrinho.id}, produtoId: ${itemCarrinho.produtoId}`);
    if (!itemCarrinho.produtoId) {
        console.warn(`[ResolveField] ItemCarrinho ${itemCarrinho.id} não possui produtoId.`);
        return null;
    }
    try {
      const produto = await this.produtosService.findOne(itemCarrinho.produtoId); // Busca entidade
      if (!produto) {
          console.warn(`[ResolveField] Produto com ID ${itemCarrinho.produtoId} não encontrado.`);
          return null;
      }
      return produto; // Retorna entidade
    } catch (error) {
        console.error(`[ResolveField] Erro ao buscar produto ${itemCarrinho.produtoId}:`, error);
        return null;
    }
  }
}
// --- Fim do ItemCarrinhoResolver ---