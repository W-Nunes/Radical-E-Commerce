<template>
    <div class="container mx-auto p-4 max-w-lg">
      <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Entrar na RadicalOne</h1>
      <form @submit.prevent="handleLogin" class="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label for="email" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="seuemail@exemplo.com"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:border-gray-600"
            :class="{ 'border-red-500': loginError }"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Senha:
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="******************"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:border-gray-600"
             :class="{ 'border-red-500': loginError }"
           />
          <p v-if="loginError" class="text-red-500 text-xs italic">{{ loginError }}</p>
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Entrando...</span>
            <span v-else>Entrar</span>
          </button>
          <router-link
            to="/registrar"
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Não tem conta? Registre-se
          </router-link>
        </div>
      </form>
      <p class="text-center text-gray-500 text-xs dark:text-gray-400">
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
  // Importar o tipo AuthPayload que criamos
  import type { AuthPayload } from '../types/auth.payload';
  
  // --- Refs para os campos do formulário ---
  const email = ref('');
  const password = ref('');
  
  // --- Estado do componente ---
  // loginError para armazenar mensagens de erro
  const loginError = ref<string | null>(null);
  // loading é pego diretamente do useMutation
  
  // --- Instâncias ---
  const authStore = useAuthStore();
  const router = useRouter();
  
  // --- Definição da GraphQL Mutation ---
  const LOGIN_MUTATION = gql`
    mutation Login($dadosLogin: LoginInput!) {
      login(dadosLogin: $dadosLogin) {
        accessToken
        usuario {
          id
          nome
          email
          criadoEm
        }
      }
    }
  `;
  
  // --- Configuração do useMutation do Apollo ---
  const {
    mutate: executarLogin,
    loading,              // Usar diretamente no :disabled e no texto do botão
    // error: errorRaw,    // Não precisamos do erro bruto se tratamos no onError
    onDone,
    onError,
  } = useMutation< { login: AuthPayload } >(LOGIN_MUTATION);
  
  // --- Lógica de Login ---
  const handleLogin = () => {
    loginError.value = null; // Limpa erro anterior
    console.log('[LoginPage] Tentando login com:', email.value);
    executarLogin({
      dadosLogin: {
        email: email.value,
        password: password.value,
      }
    });
  };
  
  // --- Callback de Sucesso (onDone) ---
  onDone(result => {
    console.log('[LoginPage] Login bem-sucedido! Resultado:', result.data);
    if (result.data?.login) {
      const { accessToken, usuario } = result.data.login;
      authStore.setAuthData(accessToken, usuario);
      router.push('/'); // Redireciona para Home
    } else {
      console.error('[LoginPage] Erro inesperado: Dados de login não encontrados na resposta.');
      loginError.value = 'Resposta inesperada do servidor após o login.';
    }
  });
  
  // --- Callback de Erro (onError) ---
  onError(error => {
    console.error('[LoginPage] Erro no login:', JSON.stringify(error, null, 2));
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      loginError.value = error.graphQLErrors[0].message || 'Erro desconhecido do servidor.';
    } else if (error.networkError) {
      loginError.value = `Erro de rede: ${error.networkError.message}. Verifique a conexão ou o servidor backend.`;
    } else {
      loginError.value = 'Ocorreu um erro inesperado durante o login.';
    }
  });
  
  </script>
  
  <style scoped>
  /* Estilos específicos para esta página, se necessário */
  </style>