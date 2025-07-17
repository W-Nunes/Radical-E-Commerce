import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios'; 
// import { firstValueFrom } from 'rxjs';
import { FreteOutput } from './dto/frete.output';

@Injectable()
export class FreteService {
  private readonly logger = new Logger(FreteService.name);

  constructor() {}

  async calcularFrete(cepDestino: string): Promise<FreteOutput[]> {
    this.logger.log(`[MOCK] Simulando cálculo de frete para o CEP: ${cepDestino}`);

    const cepLimpo = cepDestino.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      throw new BadRequestException('Formato de CEP inválido. Use 8 dígitos numéricos.');
    }

    // Simula um pequeno delay, como se fosse uma chamada de rede
    await new Promise(resolve => setTimeout(resolve, 300));

    const opcoesDeFrete: FreteOutput[] = [
      {
        servico: 'PAC',
        valor: 25.50,
        prazoEntrega: '10 dias úteis',
      },
      {
        servico: 'SEDEX',
        valor: 45.80,
        prazoEntrega: '3 dias úteis',
      },
    ];

    this.logger.verbose(`[MOCK] Retornando ${opcoesDeFrete.length} opções de frete simuladas.`);
    return opcoesDeFrete;
  }
}