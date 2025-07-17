// Crie o arquivo: backend/src/frete/dto/frete.output.ts

import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType('Frete')
export class FreteOutput {
  @Field(() => String, { description: 'Código do serviço (Ex: PAC, SEDEX)' })
  servico: string;

  @Field(() => Float, { description: 'Valor do frete em Reais (R$)' })
  valor: number;

  @Field(() => String, { description: 'Prazo de entrega em dias úteis' })
  prazoEntrega: string;
}