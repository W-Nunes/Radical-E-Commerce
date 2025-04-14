// radical/backend/src/produtos/produtos.resolver.ts
import { Resolver, Query, Args, ID, Mutation } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoOutput } from './dto/produto.output';
import { CategoriaOutput } from './dto/categoria.output';
// --- Imports Corrigidos/Adicionados ---
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
// ------------------------------------

@Resolver(() => ProdutoOutput)
export class ProdutosResolver {
  private readonly logger = new Logger(ProdutosResolver.name);

  constructor(
    @InjectRepository(ProdutoEntity)
    private readonly produtoRepository: Repository<ProdutoEntity>,
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
  ) {}

  // --- QUERIES (Mantidas como estavam) ---
  @Query(() => [ProdutoOutput], { name: 'produtos', /*...*/ })
  async buscarTodosOsProdutos(
    @Args('categoriaSlug', { type: () => String, nullable: true, /*...*/ }) categoriaSlug?: string,
  ): Promise<ProdutoOutput[]> {
    // ... (lógica da query buscarTodosOsProdutos sem alterações) ...
    this.logger.debug(`[buscarTodosOsProdutos] Buscando produtos ${categoriaSlug ? `para categoria slug: ${categoriaSlug}` : 'todos'}.`);
    const queryBuilder = this.produtoRepository.createQueryBuilder('produto')
       .leftJoinAndSelect('produto.categoria', 'categoria');

    if (categoriaSlug) {
      queryBuilder.innerJoin('produto.categoria', 'cat_filter', 'cat_filter.slug = :slug', { slug: categoriaSlug });
    }

    const produtosEntidades = await queryBuilder.getMany();
    this.logger.verbose(`[buscarTodosOsProdutos] Encontrados ${produtosEntidades.length} produtos.`);
    // Usar o map corrigido
    return produtosEntidades.map(produto => this.mapProdutoEntityToOutput(produto)).filter(p => p !== null); // Filtra nulos caso o map retorne algum
  }

  @Query(() => ProdutoOutput, { name: 'produto', nullable: true, /*...*/ })
  async buscarProdutoPorId(
    @Args('id', { type: () => ID, /*...*/ }) id: string,
  ): Promise<ProdutoOutput | null> { // <<< Assinatura já permitia null aqui, OK
    this.logger.debug(`[buscarProdutoPorId] Buscando produto com ID: ${id}`);
    const produtoEntidade = await this.produtoRepository.findOneBy({ id });

    if (!produtoEntidade) {
      this.logger.warn(`[buscarProdutoPorId] Produto com ID ${id} não encontrado.`);
      return null; // <<< Retorna null, compatível com a assinatura da Query
    }
    this.logger.verbose(`[buscarProdutoPorId] Produto encontrado: ${produtoEntidade.nome}`);
    // Usa o map corrigido (que agora também retorna null)
    return this.mapProdutoEntityToOutput(produtoEntidade);
  }

  @Query(() => [CategoriaOutput], { name: 'categorias', /*...*/ })
  async buscarCategorias(): Promise<CategoriaOutput[]> {
     // ... (lógica da query buscarCategorias sem alterações) ...
     this.logger.debug(`[buscarCategorias] Buscando todas as categorias.`);
     const categorias = await this.categoriaRepository.find();
     this.logger.verbose(`[buscarCategorias] Encontradas ${categorias.length} categorias.`);
     return categorias;
  }

  // --- MUTATIONS ---
  @Mutation(() => ProdutoOutput, { name: 'criarProduto', /*...*/ })
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  async criarProduto(
    @Args('dados') dados: CriarProdutoInput,
  ): Promise<ProdutoOutput> {
    // ... (lógica da mutation criarProduto sem alterações internas) ...
     this.logger.log(`[criarProduto] Recebida requisição para criar produto: ${dados.nome} (SKU: ${dados.sku})`);

     // 1. Validar categoria
     this.logger.debug(`[criarProduto] Buscando categoria com ID: ${dados.categoriaId}`);
     const categoriaEncontrada = await this.categoriaRepository.findOneBy({ id: dados.categoriaId });
     if (!categoriaEncontrada) {
       this.logger.warn(`[criarProduto] Categoria com ID ${dados.categoriaId} não encontrada.`);
       throw new NotFoundException(`Categoria com ID ${dados.categoriaId} não encontrada.`);
     }
     this.logger.debug(`[criarProduto] Categoria encontrada: ${categoriaEncontrada.nome}`);

     // 2. Validar SKU
     this.logger.debug(`[criarProduto] Verificando SKU: ${dados.sku}`);
     const skuExistente = await this.produtoRepository.findOneBy({ sku: dados.sku });
     if (skuExistente) {
          this.logger.warn(`[criarProduto] SKU ${dados.sku} já cadastrado para o produto ${skuExistente.nome}.`);
          throw new BadRequestException(`O SKU '${dados.sku}' já está em uso.`);
     }

     // 3. Criar entidade
     const { categoriaId, ...restanteDosDados } = dados;
     const novoProduto = this.produtoRepository.create({
       ...restanteDosDados,
       categoria: categoriaEncontrada,
     });
     this.logger.debug(`[criarProduto] Entidade Produto criada (sem salvar): ${JSON.stringify(novoProduto)}`);

     // 4. Salvar
     const produtoSalvo = await this.produtoRepository.save(novoProduto);
     this.logger.log(`[criarProduto] Produto '${produtoSalvo.nome}' (ID: ${produtoSalvo.id}) salvo com sucesso.`);

     // 5. Mapear e retornar (usando o map corrigido)
     // A categoria deve vir com o save ou por causa do eager:true
     const output = this.mapProdutoEntityToOutput(produtoSalvo);
     if (output === null) {
         // Isso não deveria acontecer aqui se o save funcionou e a categoria é obrigatória
         this.logger.error(`[criarProduto] Falha ao mapear produto recém-salvo para output! ID: ${produtoSalvo.id}`);
         throw new InternalServerErrorException('Erro ao processar dados do produto salvo.');
     }
     return output;
  }

  @Mutation(() => ProdutoOutput, { name: 'editarProduto', description: 'Atualiza um produto existente (requer autenticação).' })
  @UseGuards(JwtAuthGuard) // Protege a mutation
  @UsePipes(ValidationPipe) // Valida o DTO 'dados'
  async editarProduto(
    // Recebe o ID como argumento separado
    @Args('id', { type: () => ID } /*, ParseUUIDPipe - opcional */) id: string,
    // Recebe os dados opcionais para atualização
    @Args('dados') dados: EditarProdutoInput,
  ): Promise<ProdutoOutput> {
    this.logger.log(`[editarProduto] Recebida requisição para editar produto ID: ${id}`);
    this.logger.verbose(`[editarProduto] Dados recebidos: ${JSON.stringify(dados)}`);

    // 1. Buscar o produto existente (e sua categoria atual)
    // Usamos findOneOrFail para lançar NotFoundException automaticamente se não achar
    // Ou usamos findOne e checamos manualmente
    const produtoEncontrado = await this.produtoRepository.findOne({
        where: { id },
        relations: { categoria: true } // Carrega a relação para o mapeamento final
    });

    if (!produtoEncontrado) {
        this.logger.warn(`[editarProduto] Produto com ID ${id} não encontrado para edição.`);
        throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    this.logger.debug(`[editarProduto] Produto encontrado: ${produtoEncontrado.nome}`);

    // 2. Verificar e atualizar a categoria, se fornecida
    if (dados.categoriaId) {
      this.logger.debug(`[editarProduto] Buscando nova categoria com ID: ${dados.categoriaId}`);
      const novaCategoria = await this.categoriaRepository.findOneBy({ id: dados.categoriaId });
      if (!novaCategoria) {
        this.logger.warn(`[editarProduto] Nova categoria com ID ${dados.categoriaId} não encontrada.`);
        throw new NotFoundException(`Nova categoria com ID ${dados.categoriaId} não encontrada.`);
      }
      produtoEncontrado.categoria = novaCategoria; // Atualiza a relação
      this.logger.debug(`[editarProduto] Categoria do produto atualizada para: ${novaCategoria.nome}`);
    }

    // 3. Verificar e atualizar o SKU, checando conflitos
    if (dados.sku && dados.sku !== produtoEncontrado.sku) {
        this.logger.debug(`[editarProduto] Verificando conflito para novo SKU: ${dados.sku}`);
        const conflitoSku = await this.produtoRepository.findOne({
            where: {
                sku: dados.sku,
                id: Not(id) // Verifica se o SKU existe em OUTRO produto que não seja o atual
            }
        });
        if (conflitoSku) {
             this.logger.warn(`[editarProduto] Novo SKU ${dados.sku} já está em uso pelo produto ${conflitoSku.id}.`);
             throw new BadRequestException(`O novo SKU '${dados.sku}' já está em uso por outro produto.`);
        }
        produtoEncontrado.sku = dados.sku; // Atualiza o SKU
         this.logger.debug(`[editarProduto] SKU do produto atualizado para: ${dados.sku}`);
    }

    // 4. Atualizar outros campos fornecidos (exceto categoriaId e sku que já tratamos)
    // Usar Object.assign pode ser perigoso se o DTO tiver campos extras.
    // É mais seguro atribuir campo a campo se eles existirem nos 'dados'.
    if (dados.nome !== undefined) produtoEncontrado.nome = dados.nome;
    if (dados.descricao !== undefined) produtoEncontrado.descricao = dados.descricao; // Permite setar para null
    if (dados.preco !== undefined) produtoEncontrado.preco = dados.preco;
    if (dados.quantidadeEstoque !== undefined) produtoEncontrado.quantidadeEstoque = dados.quantidadeEstoque;
    if (dados.imagemUrlPrincipal !== undefined) produtoEncontrado.imagemUrlPrincipal = dados.imagemUrlPrincipal; // Permite setar para null

    // 5. Salvar as alterações
    // O método save do TypeORM atualiza a entidade se ela já existe (baseado no ID)
    const produtoAtualizado = await this.produtoRepository.save(produtoEncontrado);
    this.logger.log(`[editarProduto] Produto '${produtoAtualizado.nome}' (ID: ${id}) atualizado com sucesso.`);

    // 6. Mapear para o Output e retornar
    const output = this.mapProdutoEntityToOutput(produtoAtualizado);
     if (output === null) {
         this.logger.error(`[editarProduto] Falha ao mapear produto recém-atualizado para output! ID: ${id}`);
         throw new InternalServerErrorException('Erro ao processar dados do produto atualizado.');
     }
    return output;
  }

  // --- MÉTODO PRIVADO DE MAPEAMENTO CORRIGIDO ---
  private mapProdutoEntityToOutput(produto: ProdutoEntity | null): ProdutoOutput | null { // <<< Assinatura permite null
     if (!produto) {
         this.logger.verbose(`[mapProdutoEntityToOutput] Recebido produto nulo, retornando null.`);
         return null; // <<< Agora isso é válido
     }

     if (!produto.categoria) {
        this.logger.error(`[mapProdutoEntityToOutput] Produto ${produto.id} (${produto.nome}) está sem categoria associada!`);
        // Lança o erro InternalServerErrorException (agora importado)
        throw new InternalServerErrorException(`Inconsistência de dados: Produto ${produto.id} não tem categoria associada, mas ela é obrigatória.`);
     }

     // Mapeamento continua igual
     return {
         id: produto.id,
         nome: produto.nome,
         descricao: produto.descricao,
         preco: produto.preco,
         sku: produto.sku,
         imagemUrlPrincipal: produto.imagemUrlPrincipal,
         emEstoque: produto.quantidadeEstoque > 0,
         quantidadeEstoque: produto.quantidadeEstoque,
         categoria: {
             id: produto.categoria.id,
             nome: produto.categoria.nome,
             slug: produto.categoria.slug,
         }
     };
   }

} // Fim da classe ProdutosResolver