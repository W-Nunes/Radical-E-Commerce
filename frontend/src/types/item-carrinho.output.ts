// radical/frontend/src/types/item-carrinho.output.ts

// Importar o tipo do ProdutoOutput (precisa criar/ajustar este arquivo também!)
import type { ProdutoOutput } from './produto.output'; // <<< VERIFICAR/CRIAR ESTE TIPO

// Define a estrutura de um item DENTRO do carrinho, como vem da API GraphQL
export interface ItemCarrinhoType {
  __typename?: 'ItemCarrinho'; // Nome do tipo no GraphQL backend (verifique no seu DTO ItemCarrinhoOutput)
  id: number;                 // ID do item do carrinho (number/int)
  produtoId: string;            // ID do Produto (UUID/string) - Pode manter por referência
  quantidade: number;
  precoUnitarioRegistrado: number; // Preço no momento da adição
  adicionadoEm: string | Date;     // A API pode retornar string ou Date

  // --- CAMPO ANINHADO ADICIONADO ---
  // Representa o objeto Produto que o backend agora retorna aninhado
  produto: ProdutoOutput | null; // O produto pode ser nulo se não for encontrado no backend
  // --- FIM DO CAMPO ANINHADO ---
}