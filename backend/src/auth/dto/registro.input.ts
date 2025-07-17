import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType() // Marca como um tipo de entrada para o GraphQL
export class RegistroInput {
  @Field() // Expõe o campo no schema GraphQL
  @IsNotEmpty({ message: 'O nome não pode estar vazio.' })
  @IsString()
  nome: string;

  @Field()
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  @IsEmail({}, { message: 'Por favor, forneça um endereço de e-mail válido.' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
  password: string;

}