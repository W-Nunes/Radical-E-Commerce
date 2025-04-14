// src/types/categoria.output.ts
// Espelha o CategoriaOutput DTO do backend
export interface CategoriaOutput {
    id: string;
    nome: string;
    slug: string; // Pode ser útil ter o slug
    descricao?: string | null; // Opcional
  }