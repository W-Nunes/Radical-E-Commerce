// radical/backend/src/produtos/produtos.resolver.ts
import { Resolver, Query, Args, ID, Mutation, ResolveField, Parent, Int, Float } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoOutput } from './dto/produto.output';
import { CategoriaOutput } from './dto/categoria.output';
import { ProdutoPaginadoOutput } from './dto/produto-paginado.output';
import { ProdutoSort } from './dto/produto-sort.enum';

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
import { ProdutosService } from './produtos.service';

@Resolver(() => ProdutoOutput)
export class ProdutosResolver {
  private readonly logger = new Logger(ProdutosResolver.name);

  constructor(
    private readonly produtosService: ProdutosService,
  ) {}

  

  @Query(() => ProdutoPaginadoOutput, { name: 'produtos' })
  async buscarTodosOsProdutos(
    @Args('categoriaSlug', { type: () => String, nullable: true }) categoriaSlug?: string,
    @Args('termoBusca', { type: () => String, nullable: true }) termoBusca?: string,
    @Args('pagina', { type: () => Int, nullable: true, defaultValue: 1 }) pagina?: number,
    @Args('limite', { type: () => Int, nullable: true, defaultValue: 4 }) limite?: number,
    @Args('ordenacao', { type: () => ProdutoSort, nullable: true, defaultValue: ProdutoSort.MAIS_RECENTES }) ordenacao?: ProdutoSort,

  ): Promise<ProdutoPaginadoOutput> {
    this.logger.debug(`[Resolver] buscarTodosOsProdutos com pagina: ${pagina}, limite: ${limite}`);
    
    const resultadoDoServico = await this.produtosService.findAll(
      categoriaSlug,
      termoBusca,
      ordenacao,
      pagina,
      limite,
    );
    
    // A correção está aqui: usamos 'as' para indicar ao TypeScript que o tipo está correto.
    return resultadoDoServico as unknown as ProdutoPaginadoOutput;
  }

  @Query(() => [ProdutoOutput], { name: 'produtosAleatorios' })
    async buscarProdutosAleatorios(
        @Args('limite', { type: () => Int, nullable: true, defaultValue: 4 }) limite?: number,
    ): Promise<ProdutoEntity[]> {
        this.logger.debug(`[Resolver] buscando ${limite} produtos aleatórios.`);
        return this.produtosService.findRandom(limite);
    }

  @Query(() => ProdutoOutput, { name: 'produto', nullable: true })
  async buscarProdutoPorId(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProdutoEntity | null> {
    this.logger.debug(`[buscarProdutoPorId] Buscando produto com ID: ${id}`);
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
    const categorias = await this.produtosService.findAllCategorias();
    this.logger.verbose(`[buscarCategorias] Encontradas ${categorias.length} categorias.`);
    return categorias;
  }

  @Mutation(() => ProdutoOutput, { name: 'criarProduto' })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async criarProduto(
    @Args('dados') dados: CriarProdutoInput,
  ): Promise<ProdutoEntity> {
    this.logger.log(`[criarProduto] Recebida requisição para criar produto: ${dados.nome} (SKU: ${dados.sku})`);
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
    const produtoAtualizado = await this.produtosService.update(id, dados);
    this.logger.log(`[editarProduto] Produto '${produtoAtualizado.nome}' (ID: ${id}) atualizado com sucesso.`);
    return produtoAtualizado;
  }

  @ResolveField('emEstoque', () => Boolean)
  getEmEstoque(@Parent() produto: ProdutoEntity): boolean {
      this.logger.verbose(`[ResolveField emEstoque] Calculando para Produto ID: ${produto.id} (Estoque: ${produto.quantidadeEstoque})`);
      if (typeof produto.quantidadeEstoque !== 'number') {
           this.logger.error(`[ResolveField emEstoque] Produto ID ${produto.id} não possui quantidadeEstoque válida!`);
           return false;
      }
      return produto.quantidadeEstoque > 0;
  }
}