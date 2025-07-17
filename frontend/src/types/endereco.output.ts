// Espelha o EnderecoOutput DTO do backend
export interface EnderecoOutputType {
    rua: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  }