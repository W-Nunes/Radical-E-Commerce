import type { CategoriaOutput } from "./categoria.output"; 

// Espelha do ProdutoOutput DTO do backend
export interface ProdutoOutput {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  sku: string;
  imagemUrlPrincipal: string | null;
  categoria: CategoriaOutput;
  emEstoque: boolean;
  quantidadeEstoque: number;
}