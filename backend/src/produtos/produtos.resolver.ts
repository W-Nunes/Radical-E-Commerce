import { Resolver, Query, Args, ID, ResolveField, Parent } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoOutput } from './dto/produto.output';
import { CategoriaOutput } from './dto/categoria.output';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => ProdutoOutput) // Indica que este resolver lida primariamente com ProdutoOutput
export class ProdutosResolver {
  constructor(
    // Injeta os repositórios do TypeORM
    @InjectRepository(ProdutoEntity)
    private readonly produtoRepository: Repository<ProdutoEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
  ) {}

  // --- QUERIES ---

  @Query(() => [ProdutoOutput], { name: 'produtos', description: 'Busca todos os produtos, com filtro opcional por slug da categoria.' })
  async buscarTodosOsProdutos(
    @Args('categoriaSlug', { type: () => String, nullable: true, description: 'Slug da categoria para filtrar os produtos' }) categoriaSlug?: string,
  ): Promise<ProdutoOutput[]> {
    const queryBuilder = this.produtoRepository.createQueryBuilder('produto')
       // Carrega a relação 'categoria' automaticamente por causa do 'eager: true' na entidade,
       // mas podemos ser explícitos se quisermos: .leftJoinAndSelect('produto.categoria', 'categoria');

    if (categoriaSlug) {
      // Filtra pela slug da categoria relacionada
      queryBuilder.innerJoin('produto.categoria', 'categoria', 'categoria.slug = :slug', { slug: categoriaSlug });
    }

    const produtosEntidades = await queryBuilder.getMany();

    // Mapeia Entidade para Output DTO (incluindo o campo calculado 'emEstoque')
    return produtosEntidades.map(produto => ({
      ...produto,
      emEstoque: produto.quantidadeEstoque > 0,
    }));
  }

  @Query(() => ProdutoOutput, { name: 'produto', nullable: true, description: 'Busca um único produto pelo seu ID.' })
  async buscarProdutoPorId(
    @Args('id', { type: () => ID, description: 'ID (UUID) do produto a ser buscado' }) id: string,
  ): Promise<ProdutoOutput | null> {
    // 'relations' não é necessário aqui por causa do 'eager: true' na entidade Categoria
    const produtoEntidade = await this.produtoRepository.findOne({ where: { id } });

    if (!produtoEntidade) {
      return null; // Retorna null se não encontrado, como padrão no GraphQL
    }

    // Mapeia para o DTO de saída
    return {
      ...produtoEntidade,
      emEstoque: produtoEntidade.quantidadeEstoque > 0,
    };
  }

  @Query(() => [CategoriaOutput], { name: 'categorias', description: 'Busca todas as categorias.' })
  async buscarCategorias(): Promise<CategoriaOutput[]> {
    // Como CategoriaOutput é simples e corresponde à entidade, podemos retornar diretamente
    return this.categoriaRepository.find();
  }

  // --- RESOLVE FIELD ---
  // Exemplo se não usássemos 'eager: true' ou precisássemos buscar dados adicionais
  // @ResolveField('categoria', () => CategoriaOutput)
  // async buscarCategoriaDoProduto(@Parent() produto: ProdutoEntity): Promise<CategoriaOutput> {
  //   // Aqui buscaríamos a categoria associada ao produto 'pai'
  //   console.log('Resolvendo campo categoria para o produto:', produto.id);
  //   // Esta chamada seria feita apenas se o cliente GraphQL pedisse o campo 'categoria'
  //   return await this.categoriaRepository.findOne({ where: { id: produto.categoria.id } }); // Exemplo simplificado
  // }

  // --- MUTATIONS ---
  // Adicionar mutations (criarProduto, atualizarProduto, etc.) aqui depois...
  // Exemplo (requer DTOs de Input e lógica de serviço):
  // @Mutation(() => ProdutoOutput)
  // async criarProduto(@Args('dadosProduto') dadosProduto: CriarProdutoInput): Promise<ProdutoOutput> {
  //   // ... lógica para criar e salvar ...
  // }
}