import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutosResolver } from './produtos.resolver';
// Importe e registre Services aqui se criá-los (ex: ProdutosService)

@Module({
  imports: [
    // Disponibiliza os repositórios de ProdutoEntity e CategoriaEntity para este módulo
    TypeOrmModule.forFeature([ProdutoEntity, CategoriaEntity]),
  ],
  // Registra o Resolver para que o NestJS o reconheça e o GraphQLModule o use
  providers: [
      ProdutosResolver,
      // ProdutosService // Se você criar um serviço para a lógica
    ],
})
export class ProdutosModule {}