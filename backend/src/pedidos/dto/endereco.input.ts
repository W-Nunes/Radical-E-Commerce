import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, MaxLength, Length, IsNumberString  } from 'class-validator';

@InputType()
class EnderecoDetalheInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  rua: string;

  @Field()
  @IsNotEmpty({ message: 'O número não pode estar vazio.' })
  @IsNumberString({}, { message: 'O número deve ser uma string de dígitos.' }) // Garante que o valor seja uma string contendo apenas números
  @MaxLength(10, { message: 'O número deve ter no máximo 10 caracteres.' })
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
  estado: string; 

  @Field()
  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'O CEP deve conter exatamente 8 dígitos.' })
  cep: string;
}

@InputType()
export class EnderecoInput {
  @Field(() => EnderecoDetalheInput)
  entrega: EnderecoDetalheInput;

  @Field(() => EnderecoDetalheInput, { nullable: true })
  @IsOptional()
  faturamento?: EnderecoDetalheInput;
}