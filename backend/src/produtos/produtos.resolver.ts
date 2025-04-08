import { Resolver, Query, Args, ID } from '@nestjs/graphql'; // Removido ResolveField, Parent por enquanto
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoOutput } from './dto/produto.output';
import { CategoriaOutput } from './dto/categoria.output';
import { NotFoundException, Logger } from '@nestjs/common'; // Importar Logger

@Resolver(() => ProdutoOutput)
export class ProdutosResolver {
  // Criar um logger para esta classe
  private readonly logger = new Logger(ProdutosResolver.name);

  constructor(
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
       // Garante que a relação categoria seja carregada (mesmo se eager:true for removido no futuro)
       .leftJoinAndSelect('produto.categoria', 'categoria');

    if (categoriaSlug) {
      // Renomeado alias do join de filtro para evitar conflito com o alias 'categoria' do select
      queryBuilder.innerJoin('produto.categoria', 'cat_filter', 'cat_filter.slug = :slug', { slug: categoriaSlug });
    }

    const produtosEntidades = await queryBuilder.getMany();

    // --- MAPEAMENTO EXPLÍCITO APLICADO ---
    return produtosEntidades.map(produto => {
        // Verificação de segurança: a categoria deveria sempre existir devido ao nullable:false
        if (!produto.categoria) {
           this.logger.error(`Produto ${produto.id} (${produto.nome}) está sem categoria associada no banco! Pulando este produto no resultado.`);
           // Lançar um erro aqui pararia toda a query. Retornar null/undefined ou filtrar
           // pode ser uma opção dependendo do requisito, mas indica um problema nos dados.
           // Por segurança, vamos pular este produto problemático (requer ajuste no tipo de retorno se filtrar)
           // Melhor ainda: lançar erro para indicar inconsistência
            throw new Error(`Inconsistência de dados: Produto ${produto.id} sem categoria obrigatória.`);
        }

        // Constrói o objeto ProdutoOutput explicitamente
        const produtoOutput: ProdutoOutput = {
            id: produto.id,
            nome: produto.nome,
            descricao: produto.descricao, // Já é string | null
            preco: produto.preco,
            sku: produto.sku,
            imagemUrlPrincipal: produto.imagemUrlPrincipal, // Já é string | null
            emEstoque: produto.quantidadeEstoque > 0,
            // Mapeia a categoria para CategoriaOutput
            categoria: {
                id: produto.categoria.id,
                nome: produto.categoria.nome,
                slug: produto.categoria.slug,
            }
        };
        return produtoOutput;
    });
    // ---------------------------------
  }

  @Query(() => ProdutoOutput, { name: 'produto', nullable: true, description: 'Busca um único produto pelo seu ID.' })
  async buscarProdutoPorId(
    @Args('id', { type: () => ID, description: 'ID (UUID) do produto a ser buscado' }) id: string,
  ): Promise<ProdutoOutput | null> {
    // Carrega o produto e sua categoria (eager: true na entidade ajuda, mas leftJoinAndSelect aqui seria mais explícito se eager fosse false)
    const produtoEntidade = await this.produtoRepository.findOne({
        where: { id },
        // relations: ['categoria'] // Necessário se eager:false na entidade
    });

    if (!produtoEntidade) {
      return null; // Produto não encontrado
    }

    // --- MAPEAMENTO EXPLÍCITO APLICADO ---
    // Verificação de segurança para categoria
    if (!produtoEntidade.categoria) {
        this.logger.error(`Produto ${produtoEntidade.id} (${produtoEntidade.nome}) está sem categoria associada no banco!`);
        // Como a query GraphQL espera um ProdutoOutput ou null, retornar null aqui pode ser uma opção,
        // mas indica um sério problema nos dados. Lançar um erro é mais informativo sobre a inconsistência.
         throw new Error(`Inconsistência de dados: Produto ${produtoEntidade.id} sem categoria obrigatória.`);
    }

    // Constrói o objeto ProdutoOutput explicitamente
    const produtoOutput: ProdutoOutput = {
        id: produtoEntidade.id,
        nome: produtoEntidade.nome,
        descricao: produtoEntidade.descricao,
        preco: produtoEntidade.preco,
        sku: produtoEntidade.sku,
        imagemUrlPrincipal: produtoEntidade.imagemUrlPrincipal,
        emEstoque: produtoEntidade.quantidadeEstoque > 0,
        // Mapeia a categoria para CategoriaOutput
        categoria: {
            id: produtoEntidade.categoria.id,
            nome: produtoEntidade.categoria.nome,
            slug: produtoEntidade.categoria.slug,
        }
    };
    return produtoOutput;
    // ---------------------------------
  }

  @Query(() => [CategoriaOutput], { name: 'categorias', description: 'Busca todas as categorias.' })
  async buscarCategorias(): Promise<CategoriaOutput[]> {
    return this.categoriaRepository.find();
  }

  // --- MUTATIONS --- (Ainda como exemplo)
  // @Mutation(() => ProdutoOutput)
  // async criarProduto(@Args('dadosProduto') dadosProduto: CriarProdutoInput): Promise<ProdutoOutput> {
  //   // ...
  // }
}