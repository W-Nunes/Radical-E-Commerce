// backend/src/produtos/dto/produto-sort.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum ProdutoSort {
  MAIS_RECENTES = 'MAIS_RECENTES',
  PRECO_ASC = 'PRECO_ASC',
  PRECO_DESC = 'PRECO_DESC',
}

registerEnumType(ProdutoSort, {
  name: 'ProdutoSort',
  description: 'Opções para ordenação da lista de produtos.',
});