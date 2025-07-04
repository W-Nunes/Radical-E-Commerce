import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosResolver } from './produtos.resolver';
import { ProdutosService } from './produtos.service';
import { ProdutoEntity } from '../database/entities/produto.entity'; // Usando alias de path
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { CriarProdutoInput } from '../produtos/dto/criar-produto.input';
import { NotFoundException, BadRequestException } from '@nestjs/common'; // Importar exceções

// Mock (simulação) do nosso ProdutosService
const mockProdutosService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findAllCategorias: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};

// Descreve a suíte de testes para o 'ProdutosResolver'
describe('ProdutosResolver', () => {
  let resolver: ProdutosResolver;
  let service: ProdutosService;

  // Bloco que é executado antes de cada teste
  beforeEach(async () => {
    // Limpa os mocks antes de cada teste para evitar que um teste influencie o outro
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosResolver,
        {
          provide: ProdutosService,
          useValue: mockProdutosService, // Usamos nosso mock no lugar do serviço real
        },
      ],
    }).compile();

    resolver = module.get<ProdutosResolver>(ProdutosResolver);
    service = module.get<ProdutosService>(ProdutosService);
  });

  // Teste 1: Garante que o resolver foi inicializado corretamente
  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

  // Grupo de testes para a query 'produtos' (buscarTodosOsProdutos)
  describe('buscarTodosOsProdutos', () => {
    it('deve retornar um array de produtos', async () => {
      const resultadoMock: ProdutoEntity[] = [
        { id: '1', nome: 'Skate Completo', preco: 300, sku: 'SKT-001' } as ProdutoEntity,
      ];
      mockProdutosService.findAll.mockReturnValue(Promise.resolve(resultadoMock));
      
      const resultado = await resolver.buscarTodosOsProdutos();
      
      expect(resultado).toEqual(resultadoMock);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  // --- CORREÇÃO E EXPANSÃO AQUI ---
  // Grupo de testes para a mutation 'criarProduto'
  describe('criarProduto', () => {
    it('deve criar e retornar um produto quando os dados são válidos', async () => {
      const dadosDeEntrada: CriarProdutoInput = {
        nome: 'Shape Novo',
        preco: 150.50,
        sku: 'SHP-NV-001',
        categoriaId: 'cat-uuid-1',
        quantidadeEstoque: 10,
      };

      // Corrigindo o mock para ser uma ProdutoEntity completa
      const resultadoMock: ProdutoEntity = {
        id: 'prod-uuid-1',
        ...dadosDeEntrada,
        descricao: null, // Campo obrigatório no tipo
        imagemUrlPrincipal: null, // Campo obrigatório no tipo
        categoria: { id: 'cat-uuid-1', nome: 'Shapes' } as CategoriaEntity, // Mock da categoria
        criadoEm: new Date(), // Campo obrigatório no tipo
        atualizadoEm: new Date(), // Campo obrigatório no tipo
      };

      mockProdutosService.create.mockResolvedValue(resultadoMock);

      const resultado = await resolver.criarProduto(dadosDeEntrada);

      expect(resultado).toEqual(resultadoMock);
      expect(service.create).toHaveBeenCalledWith(dadosDeEntrada);
    });

    it('deve repassar a exceção NotFoundException se a categoria não for encontrada', async () => {
      const dadosDeEntrada: CriarProdutoInput = {
        nome: 'Shape Inválido',
        preco: 100,
        sku: 'SHP-INV-001',
        categoriaId: 'cat-uuid-invalida',
        quantidadeEstoque: 1,
      };

      const erro = new NotFoundException('Categoria não encontrada');
      mockProdutosService.create.mockRejectedValue(erro);

      // Verifica se a chamada ao resolver realmente resulta na exceção esperada
      await expect(resolver.criarProduto(dadosDeEntrada)).rejects.toThrow(NotFoundException);
    });

     it('deve repassar a exceção BadRequestException se o SKU já existir', async () => {
      const dadosDeEntrada: CriarProdutoInput = {
        nome: 'Shape Duplicado',
        preco: 120,
        sku: 'SKU-DUPLICADO',
        categoriaId: 'cat-uuid-1',
        quantidadeEstoque: 5,
      };

      const erro = new BadRequestException("O SKU 'SKU-DUPLICADO' já está em uso.");
      mockProdutosService.create.mockRejectedValue(erro);

      await expect(resolver.criarProduto(dadosDeEntrada)).rejects.toThrow(BadRequestException);
    });
  });
});