// Crie o arquivo: backend/src/frete/frete.module.ts

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FreteService } from './frete.service';
import { FreteResolver } from './frete.resolver';

@Module({
  imports: [
    // Importa o HttpModule para que o HttpService possa ser injetado
    HttpModule.register({
      timeout: 5000, // 5 segundos
      maxRedirects: 5,
    }),
  ],
  providers: [FreteResolver, FreteService],
  // Exporta o FreteService para que outros módulos possam usá-lo no futuro
  exports: [FreteService],
})
export class FreteModule {}