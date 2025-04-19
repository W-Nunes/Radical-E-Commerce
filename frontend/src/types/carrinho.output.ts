// Define a estrutura do objeto Carrinho completo, como vem da API
import type { ItemCarrinhoType } from './item-carrinho.output'; // Importa o tipo do item

export interface CarrinhoType {
  __typename?: 'CarrinhoType';
  id: string; // ID do Carrinho (UUID/string)
  total: number; // Total calculado pelo backend
  itens: ItemCarrinhoType[]; // Array de itens do carrinho
  criadoEm: string | Date;
  atualizadoEm: string | Date;
}