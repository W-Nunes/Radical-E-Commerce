// radical/backend/src/produtos/produtos.service.ts
import {
  Injectable,
  NotFoundException,
  Logger, // Importar Logger
  BadRequestException, // Importar BadRequestException
  InternalServerErrorException, // Importar InternalServerErrorException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, Not } from 'typeorm'; // Importar Not
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity'; // Importar CategoriaEntity
import { CriarProdutoInput } from './dto/criar-produto.input'; // Importar DTOs
import { EditarProdutoInput } from './dto/editar-produto.input';

import { ProdutoSort } from './dto/produto-sort.enum';

@Injectable()
export class ProdutosService {
  // Adicionar Logger
  private readonly logger = new Logger(ProdutosService.name);

  constructor(
    @InjectRepository(ProdutoEntity)
    private readonly produtoRepository: Repository<ProdutoEntity>,
    // --- ADICIONAR INJEÇÃO ---
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
    // --- FIM ADIÇÃO ---
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
      // Passo 1: Usamos uma consulta SQL nativa para buscar os IDs aleatórios.
      // Esta abordagem é mais direta e não entra em conflito com o TypeORM.
      const resultados: { id: string }[] = await this.produtoRepository.query(
        `SELECT id FROM produtos ORDER BY RANDOM() LIMIT ${limite}`
      );
      
      // Se não houver resultados, retorna um array vazio.
      if (!resultados || resultados.length === 0) {
        return [];
      }

      // Extrai apenas os valores dos IDs do resultado.
      const ids = resultados.map(r => r.id);

      // Passo 2: Usamos o QueryBuilder para buscar as entidades completas
      // com base nos IDs aleatórios que encontramos, já incluindo a categoria.
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

  // --- MÉTODO findOne MODIFICADO ---
  // Adiciona parâmetro opcional para carregar relações e retorna null se não encontrar
  async findOne(id: string, relations: string[] = []): Promise<ProdutoEntity | null> {
    this.logger.debug(`[findOne] Buscando produto com ID: ${id} e relações: ${relations.join(', ')}`);
    // Não usar manager aqui, pois as chamadas do resolver não usarão transações por padrão
    const produto = await this.produtoRepository.findOne({
        where: { id: id },
        relations: relations, // Carrega as relações especificadas
    });
    if (!produto) {
      // Retorna null em vez de lançar exceção aqui, deixa o chamador decidir
      this.logger.warn(`[findOne] Produto com ID ${id} não encontrado.`);
      return null;
    }
    return produto;
  }
  // --- FIM findOne MODIFICADO ---


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
  // --- FIM MÉTODO findAll ---


  // --- MÉTODO NOVO: findAllCategorias ---
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
  // --- FIM MÉTODO findAllCategorias ---


  // --- MÉTODO NOVO: create ---
  async create(dados: CriarProdutoInput): Promise<ProdutoEntity> {
    this.logger.log(`[create] Recebida requisição para criar produto: ${dados.nome} (SKU: ${dados.sku})`);
    const { categoriaId, ...restanteDosDados } = dados;

    // 1. Validar categoria
    this.logger.debug(`[create] Buscando categoria com ID: ${categoriaId}`);
    const categoriaEncontrada = await this.categoriaRepository.findOneBy({ id: categoriaId });
    if (!categoriaEncontrada) {
      this.logger.warn(`[create] Categoria com ID ${categoriaId} não encontrada.`);
      throw new NotFoundException(`Categoria com ID ${categoriaId} não encontrada.`);
    }
    this.logger.debug(`[create] Categoria encontrada: ${categoriaEncontrada.nome}`);

    // 2. Validar SKU (garantir unicidade)
    this.logger.debug(`[create] Verificando SKU: ${dados.sku}`);
    const skuExistente = await this.produtoRepository.findOneBy({ sku: dados.sku });
    if (skuExistente) {
        this.logger.warn(`[create] SKU ${dados.sku} já cadastrado para o produto ${skuExistente.nome}.`);
        throw new BadRequestException(`O SKU '${dados.sku}' já está em uso.`);
    }

    // 3. Criar e salvar a entidade
    try {
        const novoProduto = this.produtoRepository.create({
            ...restanteDosDados,
            categoria: categoriaEncontrada, // Associa a categoria encontrada
        });
        this.logger.debug(`[create] Entidade Produto criada (sem salvar): ${JSON.stringify(novoProduto)}`);

        const produtoSalvo = await this.produtoRepository.save(novoProduto);
        this.logger.log(`[create] Produto '${produtoSalvo.nome}' (ID: ${produtoSalvo.id}) salvo com sucesso.`);

        // Retorna o produto salvo. O 'save' geralmente retorna a entidade com as relações que foram passadas.
        // Se a categoria não vier, pode ser necessário recarregar: return this.findOne(produtoSalvo.id, ['categoria']);
        return produtoSalvo;
    } catch (error) {
         this.logger.error(`[create] Erro ao salvar produto: ${error.message}`, error.stack);
         // Verificar se é erro de constraint (ex: SKU único no DB)
         if (error.code === '23505') { // Código PostgreSQL para unique violation
             throw new BadRequestException(`Erro de duplicidade ao salvar. Verifique SKU ou outros campos únicos.`);
         }
         throw new InternalServerErrorException('Erro ao salvar o novo produto.');
    }
  }
  // --- FIM MÉTODO create ---


  // --- MÉTODO NOVO: update ---
  async update(id: string, dados: EditarProdutoInput): Promise<ProdutoEntity> {
    this.logger.log(`[update] Recebida requisição para editar produto ID: ${id}`);
    this.logger.verbose(`[update] Dados recebidos: ${JSON.stringify(dados)}`);

    // 1. Buscar o produto existente (já carregando a categoria para evitar busca extra depois)
    // Usando findOne do próprio serviço que já retorna null ou entidade
    const produtoEncontrado = await this.findOne(id, ['categoria']);
    if (!produtoEncontrado) {
        // findOne não lança mais exceção, então precisamos lançar aqui
        this.logger.warn(`[update] Produto com ID ${id} não encontrado para edição.`);
        throw new NotFoundException(`Produto com ID ${id} não encontrado.`);
    }
    this.logger.debug(`[update] Produto encontrado: ${produtoEncontrado.nome}`);

    // 2. Verificar e atualizar a categoria, se fornecida
    if (dados.categoriaId && dados.categoriaId !== produtoEncontrado.categoria?.id) { // Só atualiza se diferente
      this.logger.debug(`[update] Buscando nova categoria com ID: ${dados.categoriaId}`);
      const novaCategoria = await this.categoriaRepository.findOneBy({ id: dados.categoriaId });
      if (!novaCategoria) {
        this.logger.warn(`[update] Nova categoria com ID ${dados.categoriaId} não encontrada.`);
        throw new NotFoundException(`Nova categoria com ID ${dados.categoriaId} não encontrada.`);
      }
      produtoEncontrado.categoria = novaCategoria; // Atualiza a relação
      this.logger.debug(`[update] Categoria do produto atualizada para: ${novaCategoria.nome}`);
    }

    // 3. Verificar e atualizar o SKU, checando conflitos
    if (dados.sku && dados.sku !== produtoEncontrado.sku) { // Só atualiza se diferente
        this.logger.debug(`[update] Verificando conflito para novo SKU: ${dados.sku}`);
        const conflitoSku = await this.produtoRepository.findOne({
            where: {
                sku: dados.sku,
                id: Not(id) // Verifica se o SKU existe em OUTRO produto
            }
        });
        if (conflitoSku) {
            this.logger.warn(`[update] Novo SKU ${dados.sku} já está em uso pelo produto ${conflitoSku.id}.`);
            throw new BadRequestException(`O novo SKU '${dados.sku}' já está em uso por outro produto.`);
        }
        produtoEncontrado.sku = dados.sku; // Atualiza o SKU
        this.logger.debug(`[update] SKU do produto atualizado para: ${dados.sku}`);
    }

    // 4. Atualizar outros campos se eles foram fornecidos no DTO
    // Object.assign é mais conciso, mas menos explícito sobre quais campos podem ser atualizados
    // delete dados.categoriaId; // Remove para não sobrescrever a entidade categoria
    // Object.assign(produtoEncontrado, dados);

    // Abordagem mais segura, campo a campo:
     if (dados.nome !== undefined) produtoEncontrado.nome = dados.nome;
     if (dados.descricao !== undefined) produtoEncontrado.descricao = dados.descricao; // Permite setar para null
     if (dados.preco !== undefined) produtoEncontrado.preco = dados.preco;
     if (dados.quantidadeEstoque !== undefined) produtoEncontrado.quantidadeEstoque = dados.quantidadeEstoque;
     if (dados.imagemUrlPrincipal !== undefined) produtoEncontrado.imagemUrlPrincipal = dados.imagemUrlPrincipal; // Permite setar para null


    // 5. Salvar as alterações
    try {
        // O save atualiza a entidade existente baseada no ID
        const produtoAtualizado = await this.produtoRepository.save(produtoEncontrado);
        this.logger.log(`[update] Produto '${produtoAtualizado.nome}' (ID: ${id}) atualizado com sucesso.`);
        // O save deve retornar a entidade atualizada, incluindo a categoria se ela foi parte do objeto salvo
        return produtoAtualizado;
    } catch (error) {
         this.logger.error(`[update] Erro ao atualizar produto ${id}: ${error.message}`, error.stack);
         if (error.code === '23505') { // Código PostgreSQL para unique violation (ex: SKU)
             throw new BadRequestException(`Erro de duplicidade ao atualizar. Verifique SKU ou outros campos únicos.`);
         }
         throw new InternalServerErrorException(`Erro ao atualizar o produto ${id}.`);
    }
  }
  // --- FIM MÉTODO update ---


  // Métodos existentes (verificarDisponibilidadeEstoque, reduzirEstoque) mantidos
  // Ajustar findOne neles se necessário (agora retorna null)

  async verificarDisponibilidadeEstoque(id: string, quantidadeNecessaria: number, manager?: EntityManager): Promise<boolean> {
    this.logger.debug(`Verificando estoque para produto ${id}, quantidade ${quantidadeNecessaria}.`);
    // Usar findOne sem lançar exceção aqui, tratar o null
    const repository = manager ? manager.getRepository(ProdutoEntity) : this.produtoRepository;
    const produto = await repository.findOne({ where: { id: id } });
    if (!produto) {
        this.logger.warn(`[verificarDisponibilidadeEstoque] Produto ${id} não encontrado.`);
        return false; // Se produto não existe, não há estoque
    }
    const estoqueAtual = produto.quantidadeEstoque;
    const disponivel = estoqueAtual >= quantidadeNecessaria;
    this.logger.verbose(`[verificarDisponibilidadeEstoque] Produto ${id}: Estoque Atual=${estoqueAtual}, Necessário=${quantidadeNecessaria}, Disponível=${disponivel}`);
    return disponivel;
  }

  async reduzirEstoque(id: string, quantidadeAReduzir: number, manager: EntityManager): Promise<void> {
    // É crucial que este método seja chamado DENTRO de uma transação (por isso recebe o manager)
    // e após verificarDisponibilidadeEstoque
    const repository = manager.getRepository(ProdutoEntity);
    this.logger.log(`Reduzindo estoque para produto ${id}, quantidade ${quantidadeAReduzir}.`);
    try {
        // Usar decrement para operação atômica
        const result = await repository.decrement({ id: id }, 'quantidadeEstoque', quantidadeAReduzir);
        // Verificar se alguma linha foi afetada para garantir que o produto existia
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

} // Fim da classe ProdutosService