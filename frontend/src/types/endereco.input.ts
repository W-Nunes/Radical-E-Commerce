// Representa os campos de um endereço, espelhando o EnderecoInput do backend
export interface EnderecoInputType {
  cep: string;
  rua: string;
  numero: string;
  complemento?: string | null; // Complemento é opcional
  bairro: string;
  cidade: string;
  estado: string; // Geralmente sigla com 2 caracteres (ex: 'SP')
}

export interface CheckoutEnderecoInputType {
    entrega: EnderecoInputType;
    faturamento?: EnderecoInputType | null; // Faturamento pode ser opcional
}