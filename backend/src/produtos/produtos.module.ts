import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProdutoEntity } from '../database/entities/produto.entity';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutosResolver } from './produtos.resolver';
import { ProdutosService } from './produtos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProdutoEntity, CategoriaEntity]),
  ],
  providers: [
      ProdutosResolver, ProdutosService,
    ],
  exports: [ProdutosService],
})
export class ProdutosModule {}