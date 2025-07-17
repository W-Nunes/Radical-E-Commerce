import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import {
  IsNotEmpty, // Não pode estar vazio
  IsString,   // Deve ser string
  IsOptional, // É opcional
  IsNumber,   // Deve ser número
  IsPositive, // Deve ser positivo
  Min,        // Valor mínimo
  IsUUID,     // Deve ser um UUID v4
  MaxLength,  // Comprimento máximo
  IsUrl,      // Deve ser uma URL válida
} from 'class-validator'; // Biblioteca para validações

@InputType() // Marca como um tipo de entrada para o GraphQL
export class CriarProdutoInput {
  @Field(() => String, { description: 'Nome do produto' })
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @IsString()
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
  nome: string;

  @Field(() => String, { nullable: true, description: 'Descrição detalhada do produto (opcional)' })
  @IsOptional() // Marca o campo como opcional
  @IsString()
  descricao?: string | null; // Permite que seja string, nulo ou indefinido

  @Field(() => Float, { description: 'Preço do produto' })
  @IsNotEmpty({ message: 'O preço não pode estar vazio.' })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número com até 2 casas decimais.' })
  @IsPositive({ message: 'O preço deve ser um valor positivo.' })
  preco: number;

  @Field(() => String, { description: 'Código único de referência do produto (SKU)' })
  @IsNotEmpty({ message: 'O SKU não pode estar vazio.' })
  @IsString()
  sku: string;

  @Field(() => Int, { description: 'Quantidade inicial em estoque', defaultValue: 0 }) // Valor padrão 0 no GraphQL
  @IsNotEmpty({ message: 'A quantidade em estoque não pode estar vazia.' })
  @IsNumber({}, { message: 'A quantidade deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade em estoque não pode ser negativa.' })
  quantidadeEstoque: number;

  @Field(() => String, { nullable: true, description: 'URL da imagem principal do produto (opcional)' })
  @IsOptional()
  @IsUrl({}, { message: 'URL da imagem inválida.'}) // Valida se é uma URL
  imagemUrlPrincipal?: string | null;

  @Field(() => ID, { description: 'ID da Categoria à qual o produto pertence' }) 
  @IsNotEmpty({ message: 'O ID da categoria não pode estar vazio.' })
  @IsUUID('4', { message: 'ID da categoria deve ser um UUID válido.'}) // Valida se é um UUID versão 4
  categoriaId: string; // Receberemos apenas o ID da categoria existente
}