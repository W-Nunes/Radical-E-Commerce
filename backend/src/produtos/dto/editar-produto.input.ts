import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsNumber,
  IsPositive,
  Min,
  IsUUID,
  MaxLength,
  IsUrl,
} from 'class-validator';

@InputType()
export class EditarProdutoInput {

  @Field(() => String, { nullable: true, description: 'Novo nome do produto (opcional)' })
  @IsOptional() 
  @IsString()
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres.' })
  nome?: string;

  @Field(() => String, { nullable: true, description: 'Nova descrição detalhada (opcional)' })
  @IsOptional()
  @IsString()
  descricao?: string | null;

  @Field(() => Float, { nullable: true, description: 'Novo preço do produto (opcional)' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número com até 2 casas decimais.' })
  @IsPositive({ message: 'O preço deve ser um valor positivo.' })
  preco?: number;

  @Field(() => String, { nullable: true, description: 'Novo código SKU (opcional, deve ser único)' })
  @IsOptional()
  @IsString()
  sku?: string; 

  @Field(() => Int, { nullable: true, description: 'Nova quantidade em estoque (opcional)' })
  @IsOptional()
  @IsNumber({}, { message: 'A quantidade deve ser um número inteiro.' })
  @Min(0, { message: 'A quantidade em estoque não pode ser negativa.' })
  quantidadeEstoque?: number;

  @Field(() => String, { nullable: true, description: 'Nova URL da imagem principal (opcional)' })
  @IsOptional()
  @IsUrl({}, { message: 'URL da imagem inválida.'})
  imagemUrlPrincipal?: string | null;

  @Field(() => ID, { nullable: true, description: 'Novo ID da Categoria (opcional)' })
  @IsOptional()
  @IsUUID('4', { message: 'ID da categoria deve ser um UUID válido.'})
  categoriaId?: string; 
}