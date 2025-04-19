// Define a estrutura para detalhes de endereço
export interface EnderecoDetalheInput {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string; // Sigla UF
    cep: string;
  }
  
  // Define a estrutura do input para a mutation criarPedido
  export interface EnderecoInput {
    entrega: EnderecoDetalheInput;
    faturamento?: EnderecoDetalheInput; // Opcional
  }