import type { ItemCarrinhoType } from './item-carrinho.output'; // Importa o tipo do item

export interface CarrinhoType {
  __typename?: 'CarrinhoType';
  id: string; 
  total: number; 
  itens: ItemCarrinhoType[]; 
  criadoEm: string | Date;
  atualizadoEm: string | Date;
}