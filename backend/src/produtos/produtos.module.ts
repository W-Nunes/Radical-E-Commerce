import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutosResolver } from './produtos.resolver';
import { ProdutosService } from './produtos.service';
// Importe e registre Services aqui se criá-los (ex: ProdutosService)

@Module({
  imports: [
    // Disponibiliza os repositórios de ProdutoEntity e CategoriaEntity para este módulo
    TypeOrmModule.forFeature([ProdutoEntity, CategoriaEntity]),
  ],
  // Registra o Resolver para que o NestJS o reconheça e o GraphQLModule o use
  providers: [
      ProdutosResolver, ProdutosService,
      // ProdutosService // Se você criar um serviço para a lógica
    ],
  exports: [ProdutosService],
})
export class ProdutosModule {}