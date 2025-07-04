import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { UserEntity } from '../src/database/entities/user.entity';
import { CategoriaEntity } from '../src/database/entities/categoria.entity';
import { ProdutoEntity } from '../src/database/entities/produto.entity';

describe('ProdutosResolver (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authService: AuthService;
  let authToken: string;
  let categoriaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const entities = dataSource.entityMetadatas;
    const tableNames = entities.map(entity => `"${entity.tableName}"`).join(', ');
    await dataSource.query(`TRUNCATE ${tableNames} RESTART IDENTITY CASCADE;`);
    
    const userRepo = dataSource.getRepository(UserEntity);
    const password = 'password123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await userRepo.save({
      nome: 'Usuário de Teste',
      email: 'teste@example.com',
      passwordHash: passwordHash,
      role: 'ADMIN',
    });

    const loginResponse = await authService.login({
      email: 'teste@example.com',
      password: password,
    });
    authToken = loginResponse.accessToken;
    
    const categoriaRepo = dataSource.getRepository(CategoriaEntity);
    const categoria = await categoriaRepo.save({
      nome: 'Categoria de Teste',
      slug: 'categoria-de-teste',
    });
    categoriaId = categoria.id;
  });

  describe('Mutation: criarProduto', () => {
    it('deve criar um produto no banco de dados quando autenticado', async () => {
      const criarProdutoMutation = `
        mutation CriarProduto($dados: CriarProdutoInput!) {
          criarProduto(dados: $dados) {
            id
            nome
            sku
          }
        }
      `;
      const dadosProduto = {
        nome: 'Produto Autenticado',
        preco: 250.00,
        sku: 'SKU-AUTH-001',
        quantidadeEstoque: 15,
        categoriaId: categoriaId,
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: criarProdutoMutation,
          variables: { dados: dadosProduto },
        })
        .expect(200);
        
      const produtoCriado = response.body.data.criarProduto;
      expect(produtoCriado).toBeDefined();
      expect(produtoCriado.id).toBeDefined();

      const produtoNoBanco = await dataSource
        .getRepository(ProdutoEntity)
        .findOneBy({ id: produtoCriado.id });

      expect(produtoNoBanco).toBeDefined();
      expect(produtoNoBanco?.sku).toEqual('SKU-AUTH-001');
    });
  });
});