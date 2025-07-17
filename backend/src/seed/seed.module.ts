import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoEntity } from '../database/entities/produto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CategoriaEntity, ProdutoEntity]),
  ],
  providers: [SeedService],
})
export class SeedModule {}