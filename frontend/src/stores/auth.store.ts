// src/stores/auth.store.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { UserOutput } from '@/types/user.output'; // Importa o tipo

// Nome do store: 'auth'
export const useAuthStore = defineStore('auth', () => {
  // --- State ---
  // Usamos ref para criar estado reativo. null indica estado inicial não autenticado.
  const token = ref<string | null>(null); // Armazena o token JWT
  const usuario = ref<UserOutput | null>(null); // Armazena os dados do usuário logado

  // --- Getters (Computed Properties) ---
  // !! converte o valor para booleano (true se tiver valor, false se for null/undefined)
  const isAuthenticated = computed(() => !!token.value && !!usuario.value);
  const usuarioLogado = computed(() => usuario.value); // Getter para acessar os dados do usuário
  const authToken = computed(() => token.value); // Getter para acessar o token

  // --- Actions ---
  // Ação para definir os dados após login/registro bem-sucedido
  function setAuthData(newToken: string, userData: UserOutput) {
    console.log('[AuthStore] Definindo dados de autenticação para:', userData.email);
    token.value = newToken;
    usuario.value = userData;
    // O plugin pinia-plugin-persistedstate salvará isso automaticamente no localStorage
  }

  // Ação para limpar os dados durante o logout
  function limparAuthData() {
    console.log('[AuthStore] Limpando dados de autenticação (logout).');
    token.value = null;
    usuario.value = null;
    // O plugin pinia-plugin-persistedstate limpará isso automaticamente do localStorage
  }

  // Retorna o estado, getters e actions para serem usados nos componentes
  return {
    token,
    usuario,
    isAuthenticated,
    usuarioLogado,
    authToken,
    setAuthData,
    limparAuthData,
  };
}, {
  // --- Configuração da Persistência ---
  // Habilita a persistência para este store
  persist: true,
  // Por padrão, o pinia-plugin-persistedstate usa localStorage e salva todo o estado.
  // Você pode configurar para usar sessionStorage ou salvar apenas partes do estado se precisar.
});