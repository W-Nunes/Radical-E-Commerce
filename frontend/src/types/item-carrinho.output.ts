import type { ProdutoOutput } from './produto.output';

// Define a estrutura de um item no carrinho
export interface ItemCarrinhoType {
  __typename?: 'ItemCarrinho'; 
  id: number;                 
  produtoId: string;           
  quantidade: number;
  precoUnitarioRegistrado: number; 
  adicionadoEm: string | Date;    

  // Representa o objeto Produto que o backend retorna
  produto: ProdutoOutput | null; // O produto pode ser nulo se não for encontrado no backend
}