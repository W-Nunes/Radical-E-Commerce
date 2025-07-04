// Este arquivo garante que o módulo 'crypto' esteja disponível globalmente para os testes.
const crypto = require('crypto');

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => crypto.randomUUID(),
    // Adicione outras funções do crypto aqui se necessário no futuro
  },
  writable: true,
});