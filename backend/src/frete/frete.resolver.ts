// Crie o arquivo: backend/src/frete/frete.resolver.ts

import { Resolver, Query, Args } from '@nestjs/graphql';
import { FreteService } from './frete.service';
import { FreteOutput } from './dto/frete.output';

@Resolver(() => FreteOutput)
export class FreteResolver {
  constructor(private readonly freteService: FreteService) {}

  @Query(() => [FreteOutput], { name: 'calcularFrete' })
  async calcularFrete(
    @Args('cep', { type: () => String }) cep: string,
  ): Promise<FreteOutput[]> {
    return this.freteService.calcularFrete(cep);
  }
}