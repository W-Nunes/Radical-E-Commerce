// Espelha o UserOutput DTO do backend)
export interface UserOutput {
    id: string;
    nome: string;
    email: string;
    criadoEm: string | Date; // Pode vir como string ISO, converter se necessário
  }