import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';

import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoEntity } from '../database/entities/produto.entity';

interface CategoriaSeed {
    nome: string;
    slug: string;
    descricao?: string; 
}

interface ProdutoSeed {
    nome: string;
    descricao?: string;
    preco: number;
    sku: string;
    quantidadeEstoque: number;
    imagemUrlPrincipal?: string;
    categoriaSlug: string; 
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(CategoriaEntity)
    private readonly categoriaRepository: Repository<CategoriaEntity>,
    @InjectRepository(ProdutoEntity)
    private readonly produtoRepository: Repository<ProdutoEntity>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Verificando necessidade de popular o banco de dados...');
    await this.seedDatabase();
  }

  async seedDatabase() {
    try {
      const countCategorias = await this.categoriaRepository.count();
      if (countCategorias === 0) {
        this.logger.log('Nenhuma categoria encontrada. Populando categorias...');
        const caminhoArquivoCategorias = join(__dirname, '..', 'database', 'seeds', 'categorias.json');
        const dadosCategorias = JSON.parse(await fs.readFile(caminhoArquivoCategorias, 'utf-8')) as CategoriaSeed[];

        const categoriasParaSalvar = dadosCategorias.map(cat => {
            const novaCategoria = this.categoriaRepository.create();
            novaCategoria.nome = cat.nome;
            novaCategoria.slug = cat.slug;
            novaCategoria.descricao = cat.descricao ?? null; 
            return novaCategoria;
         });

        await this.categoriaRepository.save(categoriasParaSalvar);
        this.logger.log(`${categoriasParaSalvar.length} categorias populadas com sucesso.`);
      } else {
        this.logger.log('Banco de dados já contém categorias. Pulando seeding de categorias.');
      }

      const countProdutos = await this.produtoRepository.count();

      if (countProdutos === 0) {
        this.logger.log('Nenhum produto encontrado. Populando produtos...');
        const caminhoArquivoProdutos = join(__dirname, '..', 'database', 'seeds', 'produtos.json');
        const dadosProdutos = JSON.parse(await fs.readFile(caminhoArquivoProdutos, 'utf-8')) as ProdutoSeed[];
        const produtosParaSalvar : ProdutoEntity[] = [];

        for (const prod of dadosProdutos) {
          const categoria = await this.categoriaRepository.findOneBy({ slug: prod.categoriaSlug });

          if (categoria) {
            const novoProduto = this.produtoRepository.create();
            novoProduto.nome = prod.nome;
            novoProduto.descricao = prod.descricao ?? null; 
            novoProduto.preco = prod.preco;
            novoProduto.sku = prod.sku;
            novoProduto.quantidadeEstoque = prod.quantidadeEstoque;
            novoProduto.imagemUrlPrincipal = prod.imagemUrlPrincipal ?? null; 
            novoProduto.categoria = categoria;
            produtosParaSalvar.push(novoProduto);
          } else {
            this.logger.warn(`Categoria com slug '${prod.categoriaSlug}' não encontrada para o produto '${prod.nome}'. Produto não será populado.`);
          }
        } 

        if (produtosParaSalvar.length > 0) {
            await this.produtoRepository.save(produtosParaSalvar);
            this.logger.log(`${produtosParaSalvar.length} produtos populados com sucesso.`);
        } else {
             this.logger.log(`Nenhum produto válido para popular.`);
        } 

      } else { 
        this.logger.log('Banco de dados já contém produtos. Pulando seeding de produtos.');
      } 

      this.logger.log('Verificação de seeding concluída.');

    } catch (error) {
      this.logger.error('Erro durante o processo de seeding:', error);
    }
  } // Fim do método seedDatabase
} // Fim da classe SeedService