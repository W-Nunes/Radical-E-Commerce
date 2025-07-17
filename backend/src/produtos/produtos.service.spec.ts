import { Test, TestingModule } from '@nestjs/testing';
import { ProdutosResolver } from './produtos.resolver';
import { ProdutosService } from './produtos.service';
import { ProdutoEntity } from '../database/entities/produto.entity'; 
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { CriarProdutoInput } from '../produtos/dto/criar-produto.input';
import { NotFoundException, BadRequestException } from '@nestjs/common'; 

const mockProdutosService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  findAllCategorias: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
};


describe('ProdutosResolver', () => {
  let resolver: ProdutosResolver;
  let service: ProdutosService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutosResolver,
        {
          provide: ProdutosService,
          useValue: mockProdutosService,
        },
      ],
    }).compile();

    resolver = module.get<ProdutosResolver>(ProdutosResolver);
    service = module.get<ProdutosService>(ProdutosService);
  });


  it('deve estar definido', () => {
    expect(resolver).toBeDefined();
  });

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

  describe('criarProduto', () => {
    it('deve criar e retornar um produto quando os dados são válidos', async () => {
      const dadosDeEntrada: CriarProdutoInput = {
        nome: 'Shape Novo',
        preco: 150.50,
        sku: 'SHP-NV-001',
        categoriaId: 'cat-uuid-1',
        quantidadeEstoque: 10,
      };

      const resultadoMock: ProdutoEntity = {
        id: 'prod-uuid-1',
        ...dadosDeEntrada,
        descricao: null, 
        imagemUrlPrincipal: null,
        categoria: { id: 'cat-uuid-1', nome: 'Shapes' } as CategoriaEntity,
        criadoEm: new Date(),
        atualizadoEm: new Date(),
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