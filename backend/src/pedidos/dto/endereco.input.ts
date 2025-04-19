// radical/backend/src/pedidos/dto/endereco.input.ts (Exemplo - Crie este arquivo)
import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
class EnderecoDetalheInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  rua: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  numero: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  complemento?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  bairro: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  cidade: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(2)
  estado: string; // Sigla UF

  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(9) // Formato 00000-000
  cep: string;
}

@InputType()
export class EnderecoInput {
  @Field(() => EnderecoDetalheInput)
  entrega: EnderecoDetalheInput;

  @Field(() => EnderecoDetalheInput, { nullable: true })
  @IsOptional()
  faturamento?: EnderecoDetalheInput; // Opcional, usa entrega se não fornecido
}