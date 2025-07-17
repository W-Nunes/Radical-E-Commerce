import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio.' })
  @IsEmail({}, { message: 'E-mail inválido.' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'A senha não pode estar vazia.' })
  @IsString() // Garante que a senha seja string
  password: string;
}