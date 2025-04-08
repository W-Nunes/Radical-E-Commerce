import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { CategoriaEntity } from '../database/entities/categoria.entity';
import { ProdutoEntity } from '../database/entities/produto.entity';

@Module({
  imports: [
    // Importa TypeOrmModule para disponibilizar os repositórios necessários
    TypeOrmModule.forFeature([CategoriaEntity, ProdutoEntity]),
  ],
  // Registra o SeedService para que ele seja instanciado e o hook OnApplicationBootstrap seja chamado
  providers: [SeedService],
})
export class SeedModule {}