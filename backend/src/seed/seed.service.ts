import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { promises as fs } from 'fs';
import { join } from 'path';

import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoEntity } from '../database/entities/produto.entity';

// --- DEFINIR INTERFACES PARA OS DADOS DO JSON ---
interface CategoriaSeed {
    nome: string;
    slug: string;
    descricao?: string; // Marcar como opcional se pode não existir no JSON
}

interface ProdutoSeed {
    nome: string;
    descricao?: string;
    preco: number;
    sku: string;
    quantidadeEstoque: number;
    imagemUrlPrincipal?: string;
    categoriaSlug: string; // Importante para achar a categoria
}
// ---------------------------------------------

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
      // 1. Popular Categorias
      const countCategorias = await this.categoriaRepository.count();
      if (countCategorias === 0) {
        this.logger.log('Nenhuma categoria encontrada. Populando categorias...');
        const caminhoArquivoCategorias = join(__dirname, '..', 'database', 'seeds', 'categorias.json');
        // --- USAR A INTERFACE AO LER O JSON ---
        const dadosCategorias = JSON.parse(await fs.readFile(caminhoArquivoCategorias, 'utf-8')) as CategoriaSeed[];
        // --------------------------------------

        // Agora o TypeScript sabe o tipo de 'cat' no map
        const categoriasParaSalvar = dadosCategorias.map(cat => {
            const novaCategoria = this.categoriaRepository.create();
            novaCategoria.nome = cat.nome;
            novaCategoria.slug = cat.slug;
            novaCategoria.descricao = cat.descricao ?? null; // Se cat.descricao for undefined, use null
            return novaCategoria;
         });

        await this.categoriaRepository.save(categoriasParaSalvar);
        this.logger.log(`${categoriasParaSalvar.length} categorias populadas com sucesso.`);
      } else {
        this.logger.log('Banco de dados já contém categorias. Pulando seeding de categorias.');
      }

      // 2. Popular Produtos
      const countProdutos = await this.produtoRepository.count();
      // V-- Bloco IF principal começa aqui --V
      if (countProdutos === 0) {
        this.logger.log('Nenhum produto encontrado. Populando produtos...');
        const caminhoArquivoProdutos = join(__dirname, '..', 'database', 'seeds', 'produtos.json');
         // --- USAR A INTERFACE AO LER O JSON ---
        const dadosProdutos = JSON.parse(await fs.readFile(caminhoArquivoProdutos, 'utf-8')) as ProdutoSeed[];
        // --------------------------------------

        const produtosParaSalvar : ProdutoEntity[] = [];

        // Agora o TypeScript sabe o tipo de 'prod' no for...of
        for (const prod of dadosProdutos) {
          const categoria = await this.categoriaRepository.findOneBy({ slug: prod.categoriaSlug });

          if (categoria) {
            const novoProduto = this.produtoRepository.create();
            novoProduto.nome = prod.nome;
            novoProduto.descricao = prod.descricao ?? null; // Se prod.descricao for undefined, use null
            novoProduto.preco = prod.preco;
            novoProduto.sku = prod.sku;
            novoProduto.quantidadeEstoque = prod.quantidadeEstoque;
            novoProduto.imagemUrlPrincipal = prod.imagemUrlPrincipal ?? null; // Se prod.imagemUrlPrincipal for undefined, use null
            novoProduto.categoria = categoria;
            produtosParaSalvar.push(novoProduto);
          } else {
            this.logger.warn(`Categoria com slug '${prod.categoriaSlug}' não encontrada para o produto '${prod.nome}'. Produto não será populado.`);
          }
        } // <-- Fim do loop for...of

        if (produtosParaSalvar.length > 0) {
            await this.produtoRepository.save(produtosParaSalvar);
            this.logger.log(`${produtosParaSalvar.length} produtos populados com sucesso.`);
        } else {
             this.logger.log(`Nenhum produto válido para popular.`);
        } // <-- Fim do if/else interno (produtosParaSalvar.length)

      // --- > CHAVE DE FECHAMENTO ADICIONADA AQUI < ---
      } else { // <-- Este else pertence ao "if (countProdutos === 0)"
        this.logger.log('Banco de dados já contém produtos. Pulando seeding de produtos.');
      } // <-- Fim do bloco else (countProdutos)

      this.logger.log('Verificação de seeding concluída.');

    } catch (error) {
      this.logger.error('Erro durante o processo de seeding:', error);
    }
  } // <-- Fim do método seedDatabase
} // <-- Fim da classe SeedService