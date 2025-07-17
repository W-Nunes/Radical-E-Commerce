// Define o que guardaremos DENTRO do token JWT assinado
export interface JwtPayload {
    id: string;  // ID do usuário
    sub?: string;    
    email: string;  // Email do usuário (ou username)
}