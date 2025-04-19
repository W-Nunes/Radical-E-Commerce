// radical/backend/src/produtos/produtos.resolver.ts
// --- CORREÇÃO AQUI: Remover Boolean da importação ---
import { Resolver, Query, Args, ID, Mutation, ResolveField, Parent, Int, Float } from '@nestjs/graphql';
// --- FIM CORREÇÃO ---
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoOutput } from './dto/produto.output';
import { CategoriaOutput } from './dto/categoria.output';
import {
  NotFoundException,
  Logger,
  UseGuards,
  UsePipes,
  ValidationPipe,
  BadRequestException,
  InternalServerErrorException,
  ParseUUIDPipe
} from '@nestjs/common';
import { CriarProdutoInput } from './dto/criar-produto.input';
import { EditarProdutoInput } from './dto/editar-produto.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProdutosService } from './produtos.service'; // Importar ProdutosService

@Resolver(() => ProdutoOutput)
export class ProdutosResolver {
  private readonly logger = new Logger(ProdutosResolver.name);

  constructor(
    // Injetar apenas o serviço
    private readonly produtosService: ProdutosService,
  ) {}

  // --- QUERIES ---
  @Query(() => [ProdutoOutput], { name: 'produtos' })
  async buscarTodosOsProdutos(
    @Args('categoriaSlug', { type: () => String, nullable: true }) categoriaSlug?: string,
  ): Promise<ProdutoEntity[]> {
    this.logger.debug(`[buscarTodosOsProdutos] Buscando produtos ${categoriaSlug ? `para categoria slug: ${categoriaSlug}` : 'todos'}.`);
    // ERRO AQUI (Linha 54) será corrigido ao implementar 'findAll' no ProdutosService
    const produtosEntidades = await this.produtosService.findAll(categoriaSlug);
    this.logger.verbose(`[buscarTodosOsProdutos] Encontrados ${produtosEntidades.length} produtos.`);
    return produtosEntidades;
  }

  @Query(() => ProdutoOutput, { name: 'produto', nullable: true })
  async buscarProdutoPorId(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProdutoEntity | null> {
    this.logger.debug(`[buscarProdutoPorId] Buscando produto com ID: ${id}`);
    // findOne já deve existir no serviço (padrão de CRUD)
    const produtoEntidade = await this.produtosService.findOne(id);

    if (!produtoEntidade) {
      this.logger.warn(`[buscarProdutoPorId] Produto com ID ${id} não encontrado.`);
      return null;
    }
    this.logger.verbose(`[buscarProdutoPorId] Produto encontrado: ${produtoEntidade.nome}`);
    return produtoEntidade;
  }

  @Query(() => [CategoriaOutput], { name: 'categorias' })
  async buscarCategorias(): Promise<CategoriaEntity[]> {
    this.logger.debug(`[buscarCategorias] Buscando todas as categorias.`);
    // ERRO AQUI (Linha 83) será corrigido ao implementar 'findAllCategorias' no ProdutosService
    const categorias = await this.produtosService.findAllCategorias();
    this.logger.verbose(`[buscarCategorias] Encontradas ${categorias.length} categorias.`);
    return categorias;
  }

  // --- MUTATIONS ---
  @Mutation(() => ProdutoOutput, { name: 'criarProduto' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async criarProduto(
    @Args('dados') dados: CriarProdutoInput,
  ): Promise<ProdutoEntity> {
    this.logger.log(`[criarProduto] Recebida requisição para criar produto: ${dados.nome} (SKU: ${dados.sku})`);
    // ERRO AQUI (Linha 97) será corrigido ao implementar 'create' no ProdutosService
    const produtoSalvo = await this.produtosService.create(dados);
    this.logger.log(`[criarProduto] Produto '${produtoSalvo.nome}' (ID: ${produtoSalvo.id}) salvo com sucesso.`);
    return produtoSalvo;
  }

  @Mutation(() => ProdutoOutput, { name: 'editarProduto' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async editarProduto(
    @Args('id', { type: () => ID }) id: string,
    @Args('dados') dados: EditarProdutoInput,
  ): Promise<ProdutoEntity> {
    this.logger.log(`[editarProduto] Recebida requisição para editar produto ID: ${id}`);
    this.logger.verbose(`[editarProduto] Dados recebidos: ${JSON.stringify(dados)}`);
    // ERRO AQUI (Linha 113) será corrigido ao implementar 'update' no ProdutosService
    const produtoAtualizado = await this.produtosService.update(id, dados);
    this.logger.log(`[editarProduto] Produto '${produtoAtualizado.nome}' (ID: ${id}) atualizado com sucesso.`);
    return produtoAtualizado;
  }


  // --- RESOLVE FIELD ---
  // --- CORREÇÃO AQUI: Usar @Field() sem tipo explícito para Boolean ---
  @ResolveField('emEstoque', () => Boolean) // <- Pode manter o tipo aqui se preferir clareza
  // ou apenas @ResolveField('emEstoque')
  // --- FIM CORREÇÃO ---
  getEmEstoque(@Parent() produto: ProdutoEntity): boolean { // <- O tipo TS 'boolean' é importante
      this.logger.verbose(`[ResolveField emEstoque] Calculando para Produto ID: ${produto.id} (Estoque: ${produto.quantidadeEstoque})`);
      // A propriedade 'quantidadeEstoque' DEVE existir na entidade ProdutoEntity
      if (typeof produto.quantidadeEstoque !== 'number') {
           this.logger.error(`[ResolveField emEstoque] Produto ID ${produto.id} não possui quantidadeEstoque válida!`);
           return false; // Ou lançar erro? Retornar false é mais seguro.
      }
      return produto.quantidadeEstoque > 0;
  }

  // Exemplo ResolveField para Categoria (manter se necessário e ajustar)
  /*
  @ResolveField('categoria', () => CategoriaOutput)
  async getCategoria(@Parent() produto: ProdutoEntity): Promise<CategoriaOutput> {
      this.logger.verbose(`[ResolveField categoria] Buscando para Produto ID: ${produto.id}`);
      if (produto.categoria) {
          // Assumindo CategoriaEntity tem id, nome, slug
          return { id: produto.categoria.id, nome: produto.categoria.nome, slug: produto.categoria.slug };
      }
      // Implementar busca da categoria no serviço se não vier na relação
      const categoria = await this.produtosService.findCategoriaForProduto(produto.id);
      if (!categoria) throw new InternalServerErrorException(`Categoria não encontrada para produto ${produto.id}`);
      return { id: categoria.id, nome: categoria.nome, slug: categoria.slug };
  }
  */

} // Fim da classe ProdutosResolver