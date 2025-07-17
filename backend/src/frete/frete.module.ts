import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FreteService } from './frete.service';
import { FreteResolver } from './frete.resolver';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000, // 5 segundos
      maxRedirects: 5,
    }),
  ],
  providers: [FreteResolver, FreteService],
  exports: [FreteService],
})
export class FreteModule {}