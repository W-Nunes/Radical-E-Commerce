// src/types/produto.output.ts
import type { CategoriaOutput } from "./categoria.output"; // Importa o tipo de categoria

// Espelha o ProdutoOutput DTO do backend
export interface ProdutoOutput {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  sku: string;
  imagemUrlPrincipal: string | null;
  categoria: CategoriaOutput; // Categoria aninhada
  emEstoque: boolean;
  quantidadeEstoque: number;
}