import type { UserOutput } from "./user.output";

// Espelha o AuthPayload DTO do backend
export interface AuthPayload {
  accessToken: string;
  usuario: UserOutput;
}