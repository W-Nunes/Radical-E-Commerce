import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException, 
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Not } from 'typeorm'; 
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity'; 
import { CriarProdutoInput } from './dto/criar-produto.input'; 
import { EditarProdutoInput } from './dto/editar-produto.input';

import { ProdutoSort } from './dto/produto-sort.enum';

@Injectable()
export class ProdutosService {
  private readonly logger = new Logger(ProdutosService.name);

  constructor(
    @InjectRepository(ProdutoEntity)
    private readonly produtoRepository: Repository<ProdutoEntity>,

    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,

  ) {}


  async findOneBySku(sku: string): Promise<ProdutoEntity | null> {
    this.logger.debug(`[findOneBySku] Buscando produto com SKU: ${sku}`);
    const produto = await this.produtoRepository.findOne({
        where: { sku: sku },
        relations: ['categoria'], // Garante que a categoria venha junto
    });
    if (!produto) {
      this.logger.warn(`[findOneBySku] Produto com SKU ${sku} não encontrado.`);
      return null;
    }
    return produto;
  }
  
  async findRandom(limite = 4): Promise<ProdutoEntity[]> {
    this.logger.debug(`[findRandom] Buscando ${limite} produtos aleatórios.`);
    try {

      const resultados: { id: string }[] = await this.produtoRepository.query(
        `SELECT id FROM produtos ORDER BY RANDOM() LIMIT ${limite}`
      );
      

      if (!resultados || resultados.length === 0) {
        return [];
      }

      const ids = resultados.map(r => r.id);

      return this.produtoRepository
        .createQueryBuilder('produto')
        .leftJoinAndSelect('produto.categoria', 'categoria')
        .where('produto.id IN (:...ids)', { ids })
        .getMany();

    } catch (error) {
      this.logger.error(`[findRandom] Erro ao buscar produtos aleatórios: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao buscar produtos em destaque.');
    }
  }

  async findOne(id: string, relations: string[] = []): Promise<ProdutoEntity | null> {
    this.logger.debug(`[findOne] Buscando produto com ID: ${id} e relações: ${relations.join(', ')}`);
    // Não usar manager aqui, pois as chamadas do resolver não usarão transações por padrão
    const produto = await this.produtoRepository.findOne({
        where: { id: id },
        relations: relations,
    });
    if (!produto) {
      this.logger.warn(`[findOne] Produto com ID ${id} não encontrado.`);
      return null;
    }
    return produto;
  }



  // --- MÉTODO NOVO: findAll ---
  async findAll(
    categoriaSlug?: string,
    termoBusca?: string,
    ordenacao: ProdutoSort = ProdutoSort.MAIS_RECENTES, // Valor padrão
    pagina = 1,
    limite = 4,
  ): Promise<{ itens: ProdutoEntity[]; total: number; pagina: number; totalPaginas: number }> {
    const take = limite;
    const skip = (pagina - 1) * take;

    this.logger.debug(
      `[findAll] Buscando produtos. Ordenação: ${ordenacao}, Busca: "${termoBusca || ''}", Página: ${pagina}`,
    );

    const queryBuilder = this.produtoRepository
      .createQueryBuilder('produto')
      .leftJoinAndSelect('produto.categoria', 'categoria');

    if (categoriaSlug) {
      queryBuilder.andWhere('categoria.slug = :slug', { slug: categoriaSlug });
    }

    if (termoBusca) {
      queryBuilder.andWhere(
        '(produto.nome ILIKE :termoBusca OR produto.descricao ILIKE :termoBusca)',
        { termoBusca: `%${termoBusca}%` },
      );
    }

    // Lógica para aplicar a ordenação
    switch (ordenacao) {
      case ProdutoSort.PRECO_ASC:
        queryBuilder.orderBy('produto.preco', 'ASC');
        break;
      case ProdutoSort.PRECO_DESC:
        queryBuilder.orderBy('produto.preco', 'DESC');
        break;
      case ProdutoSort.MAIS_RECENTES:
      default:
        queryBuilder.orderBy('produto.criadoEm', 'DESC');
        break;
    }

    try {
      const [itens, total] = await queryBuilder
        .skip(skip)
        .take(take)
        .getManyAndCount();

      const totalPaginas = Math.ceil(total / take);
      this.logger.verbose(`[findAll] Encontrados ${total} produtos. Retornando ${itens.length} na página ${pagina}.`);

      return { itens, total, pagina, totalPaginas };
    } catch (error) {
      this.logger.error(`[findAll] Erro ao buscar produtos: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Erro ao buscar produtos.');
    }
  }
  // --- FIM ---


  // --- MÉTODO: findAllCategorias ---
  async findAllCategorias(): Promise<CategoriaEntity[]> {
      this.logger.debug('[findAllCategorias] Buscando todas as categorias.');
      try {
          const categorias = await this.categoriaRepository.find();
          this.logger.verbose(`[findAllCategorias] Encontradas ${categorias.length} categorias.`);
          return categorias;
      } catch (error) {
          this.logger.error(`[findAllCategorias] Erro ao buscar categorias: ${error.message}`, error.stack);
          throw new InternalServerErrorException('Erro ao buscar categorias.');
      }
  }
  // --- FIM ---


  // --- MÉTODO: create ---
  async create(dados: CriarProdutoInput): Promise<ProdutoEntity> {
    this.logger.log(`[create] Recebida requisição para criar produto: ${dados.nome} (SKU: ${dados.sku})`);
    const { categoriaId, ...restanteDosDados } = dados;

    this.logger.debug(`[create] Buscando categoria com ID: ${categoriaId}`);
    const categoriaEncontrada = await this.categoriaRepository.findOneBy({ id: categoriaId });
    if (!categoriaEncontrada) {
      this.logger.warn(`[create] Categoria com ID ${categoriaId} não encontrada.`);
      throw new NotFoundException(`Categoria com ID ${categoriaId} não encontrada.`);
    }
    this.logger.debug(`[create] Categoria encontrada: ${categoriaEncontrada.nome}`);

    this.logger.debug(`[create] Verificando SKU: ${dados.sku}`);
    const skuExistente = await this.produtoRepository.findOneBy({ sku: dados.sku });
    if (skuExistente) {
        this.logger.warn(`[create] SKU ${dados.sku} já cadastrado para o produto ${skuExistente.nome}.`);
        throw new BadRequestException(`O SKU '${dados.sku}' já está em uso.`);
    }

    try {
        const novoProduto = this.produtoRepository.create({
            ...restanteDosDados,
            categoria: categoriaEncontrada, 
        });
        this.logger.debug(`[create] Entidade Produto criada (sem salvar): ${JSON.stringify(novoProduto)}`);

        const produtoSalvo = await this.produtoRepository.save(novoProduto);
        this.logger.log(`[create] Produto '${produtoSalvo.nome}' (ID: ${produtoSalvo.id}) salvo com sucesso.`);

        return produtoSalvo;
    } catch (error) {
         this.logger.error(`[create] Erro ao salvar produto: ${error.message}`, error.stack);

         if (error.code === '23505') { // Código PostgreSQL para unique violation
             throw new BadRequestException(`Erro de duplicidade ao salvar. Verifique SKU ou outros campos únicos.`);
         }
         throw new InternalServerErrorException('Erro ao salvar o novo produto.');
    }
  }
  // --- FIM ---


  // --- MÉTODO: update ---
  async update(id: string, dados: EditarProdutoInput): Promise<ProdutoEntity> {
    this.logger.log(`[update] Recebida requisição para editar produto ID: ${id}`);
    this.logger.verbose(`[update] Dados recebidos: ${JSON.stringify(dados)}`);

    const produtoEncontrado = await this.findOne(id, ['categoria']);
    if (!produtoEncontrado) {
        this.logger.warn(`[update] Produto com ID ${id} não encontrado para edição.`);
        throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    this.logger.debug(`[update] Produto encontrado: ${produtoEncontrado.nome}`);

    if (dados.categoriaId && dados.categoriaId !== produtoEncontrado.categoria?.id) { 
      this.logger.debug(`[update] Buscando nova categoria com ID: ${dados.categoriaId}`);
      const novaCategoria = await this.categoriaRepository.findOneBy({ id: dados.categoriaId });
      if (!novaCategoria) {
        this.logger.warn(`[update] Nova categoria com ID ${dados.categoriaId} não encontrada.`);
        throw new NotFoundException(`Nova categoria com ID ${dados.categoriaId} não encontrada.`);
      }
      produtoEncontrado.categoria = novaCategoria; 
      this.logger.debug(`[update] Categoria do produto atualizada para: ${novaCategoria.nome}`);
    }

    if (dados.sku && dados.sku !== produtoEncontrado.sku) { 
        this.logger.debug(`[update] Verificando conflito para novo SKU: ${dados.sku}`);
        const conflitoSku = await this.produtoRepository.findOne({
            where: {
                sku: dados.sku,
                id: Not(id)
            }
        });
        if (conflitoSku) {
            this.logger.warn(`[update] Novo SKU ${dados.sku} já está em uso pelo produto ${conflitoSku.id}.`);
            throw new BadRequestException(`O novo SKU '${dados.sku}' já está em uso por outro produto.`);
        }
        produtoEncontrado.sku = dados.sku; 
        this.logger.debug(`[update] SKU do produto atualizado para: ${dados.sku}`);
    }

    // Abordagem mais segura, campo a campo:
     if (dados.nome !== undefined) produtoEncontrado.nome = dados.nome;
     if (dados.descricao !== undefined) produtoEncontrado.descricao = dados.descricao; // Permite setar para null
     if (dados.preco !== undefined) produtoEncontrado.preco = dados.preco;
     if (dados.quantidadeEstoque !== undefined) produtoEncontrado.quantidadeEstoque = dados.quantidadeEstoque;
     if (dados.imagemUrlPrincipal !== undefined) produtoEncontrado.imagemUrlPrincipal = dados.imagemUrlPrincipal; // Permite setar para null


    try {

        const produtoAtualizado = await this.produtoRepository.save(produtoEncontrado);
        this.logger.log(`[update] Produto '${produtoAtualizado.nome}' (ID: ${id}) atualizado com sucesso.`);

        return produtoAtualizado;
    } catch (error) {
         this.logger.error(`[update] Erro ao atualizar produto ${id}: ${error.message}`, error.stack);
         if (error.code === '23505') {
             throw new BadRequestException(`Erro de duplicidade ao atualizar. Verifique SKU ou outros campos únicos.`);
         }
         throw new InternalServerErrorException(`Erro ao atualizar o produto ${id}.`);
    }
  }
  // --- FIM ---




  async verificarDisponibilidadeEstoque(id: string, quantidadeNecessaria: number, manager?: EntityManager): Promise<boolean> {
    this.logger.debug(`Verificando estoque para produto ${id}, quantidade ${quantidadeNecessaria}.`);

    const repository = manager ? manager.getRepository(ProdutoEntity) : this.produtoRepository;
    const produto = await repository.findOne({ where: { id: id } });
    if (!produto) {
        this.logger.warn(`[verificarDisponibilidadeEstoque] Produto ${id} não encontrado.`);
        return false;
    }
    const estoqueAtual = produto.quantidadeEstoque;
    const disponivel = estoqueAtual >= quantidadeNecessaria;
    this.logger.verbose(`[verificarDisponibilidadeEstoque] Produto ${id}: Estoque Atual=${estoqueAtual}, Necessário=${quantidadeNecessaria}, Disponível=${disponivel}`);
    return disponivel;
  }

  async reduzirEstoque(id: string, quantidadeAReduzir: number, manager: EntityManager): Promise<void> {
    const repository = manager.getRepository(ProdutoEntity);
    this.logger.log(`Reduzindo estoque para produto ${id}, quantidade ${quantidadeAReduzir}.`);
    try {
        const result = await repository.decrement({ id: id }, 'quantidadeEstoque', quantidadeAReduzir);

        if (result.affected === 0) {
             throw new NotFoundException(`Produto com ID ${id} não encontrado durante a tentativa de decremento de estoque.`);
        }
        this.logger.log(`Estoque do produto ${id} decrementado em ${quantidadeAReduzir}.`);
    } catch (error) {
        this.logger.error(`[reduzirEstoque] Erro ao decrementar estoque para produto ${id}: ${error.message}`, error.stack);
        // Lançar erro para que a transação externa possa fazer rollback
        throw new InternalServerErrorException(`Falha ao reduzir estoque para o produto ${id}.`);
    }
  }

}