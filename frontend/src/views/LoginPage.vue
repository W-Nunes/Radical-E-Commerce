<template>
  <div class="container mx-auto p-4 max-w-lg">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Entrar na RadicalOne</h1>
    <form @submit.prevent="handleLogin" class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 mb-4">
      <div class="mb-4">
        <label for="email" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Email:
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          placeholder="seuemail@exemplo.com"
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Senha:
        </label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          placeholder="******************"
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
           />
         </div>
      <div class="pt-2"> <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-azul-radical hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-azul-radical disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Entrando...</span>
          <span v-else>Entrar</span>
        </button>
      </div>
      <div class="text-center mt-6"> <router-link
          to="/registrar"
          class="text-sm font-medium text-azul-radical hover:underline dark:text-blue-400"
        >
          Não tem conta? Registre-se
        </router-link>
      </div>
    </form>
    <p class="text-center text-gray-500 text-xs dark:text-gray-400 mt-6">
      &copy;{{ new Date().getFullYear() }} RadicalOne Corp. Todos os direitos reservados.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthPayload } from '../types/auth.payload'; // Ajuste o path se necessário
import { useToast } from "vue-toastification"; // <<< Importar useToast

// --- Refs ---
const email = ref('');
const password = ref('');
// const loginError = ref<string | null>(null); // <<< Não precisamos mais deste ref para exibir erro

// --- Instâncias ---
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast(); // <<< Obter instância do toast

// --- GraphQL ---
const LOGIN_MUTATION = gql`
  mutation Login($dadosLogin: LoginInput!) {
    login(dadosLogin: $dadosLogin) {
      accessToken
      usuario { id nome email criadoEm }
    }
  }
`;

// --- Apollo ---
const {
  mutate: executarLogin,
  loading,
  onDone,
  onError,
} = useMutation< { login: AuthPayload } >(LOGIN_MUTATION);

// --- Handler ---
const handleLogin = () => {
  // loginError.value = null; // <<< Não precisa mais
  console.log('[LoginPage] Tentando login com:', email.value);
  executarLogin({
    dadosLogin: { email: email.value, password: password.value }
  });
};

// --- Callbacks ---
onDone(result => {
  console.log('[LoginPage] Login bem-sucedido!', result.data);
  if (result.data?.login) {
    const { accessToken, usuario } = result.data.login;
    authStore.setAuthData(accessToken, usuario);
    toast.success(`Bem-vindo de volta, ${usuario.nome}!`); // <<< Usa toast de sucesso
    router.push('/');
  } else {
    console.error('[LoginPage] Erro inesperado: Dados de login não encontrados.');
    toast.error("Erro inesperado do servidor após o login."); // <<< Usa toast de erro
  }
});

onError(error => {
  console.error('[LoginPage] Erro no login:', error);
  let message = 'Ocorreu um erro inesperado durante o login.';
  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    message = error.graphQLErrors[0].message || message;
  } else if (error.networkError) {
    message = `Erro de rede: ${error.networkError.message}.`;
  }
  toast.error(message); // <<< Usa toast de erro com a mensagem tratada
  // loginError.value = message; // <<< Não precisa mais
});

</script>

<style scoped>
/* Estilos específicos para esta página, se necessário */
</style>