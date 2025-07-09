// backend/src/produtos/dto/produto-paginado.output.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { ProdutoOutput } from './produto.output';

@ObjectType()
export class ProdutoPaginadoOutput {
  @Field(() => [ProdutoOutput], { description: 'A lista de produtos para a página atual.' })
  itens: ProdutoOutput[];

  @Field(() => Int, { description: 'O número total de produtos que correspondem à consulta.' })
  total: number;

  @Field(() => Int, { description: 'O número da página atual.' })
  pagina: number;

  @Field(() => Int, { description: 'O número total de páginas disponíveis.' })
  totalPaginas: number;
}