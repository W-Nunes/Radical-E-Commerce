<template>
    <div class="container mx-auto p-4 max-w-lg">
      <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Criar Conta na RadicalOne</h1>
      <form @submit.prevent="handleRegister" class="bg-white dark:bg-gray-800 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label for="nome" class="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
            Nome:
          </label>
          <input
            id="nome"
            v-model="nome"
            type="text"
            required
            placeholder="Seu nome completo"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline dark:border-gray-600"
            :class="{ 'border-red-500': registerError && registerError.includes('nome') }"
          />
        </div>
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
            :class="{ 'border-red-500': registerError && (registerError.includes('email') || registerError.includes('E-mail')) }"
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
            placeholder="Mínimo 6 caracteres"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline dark:border-gray-600"
            :class="{ 'border-red-500': registerError && registerError.includes('senha') }"
           />
           <p v-if="registerError" class="text-red-500 text-xs italic">{{ registerError }}</p>
           <p v-if="successMessage" class="text-green-500 text-xs italic">{{ successMessage }}</p>
        </div>
        <div class="flex items-center justify-between">
          <button
            type="submit"
            :disabled="loading"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Registrando...</span>
            <span v-else>Criar Conta</span>
          </button>
          <router-link
            to="/login"
            class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Já tem conta? Entrar
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
  // Não precisamos do authStore aqui, pois não vamos logar automaticamente
  // import { useAuthStore } from '@/stores/auth.store';
  import type { UserOutput } from '@/types/user.output'; // Para tipar o resultado
  
  // --- Refs para os campos do formulário ---
  const nome = ref('');
  const email = ref('');
  const password = ref('');
  
  // --- Estado do componente ---
  const registerError = ref<string | null>(null);
  const successMessage = ref<string | null>(null); // Mensagem de sucesso
  
  // --- Instâncias ---
  const router = useRouter();
  // const authStore = useAuthStore(); // Não necessário aqui
  
  // --- Definição da GraphQL Mutation ---
  // Retorna os dados do usuário criado (sem token)
  const REGISTER_MUTATION = gql`
    mutation Registrar($dadosRegistro: RegistroInput!) {
      registrar(dadosRegistro: $dadosRegistro) {
        id
        nome
        email
        criadoEm
      }
    }
  `;
  
  // --- Configuração do useMutation ---
  const {
    mutate: executarRegistro,
    loading, // Usar diretamente no template
    // error: errorRaw, // Não precisamos se tratamos no onError
    onDone,
    onError,
  } = useMutation< { registrar: UserOutput } >(REGISTER_MUTATION);
  
  // --- Lógica de Registro ---
  const handleRegister = () => {
    registerError.value = null; // Limpa erros
    successMessage.value = null; // Limpa sucesso
    console.log('[RegisterPage] Tentando registrar com:', nome.value, email.value);
  
    executarRegistro({
      dadosRegistro: {
        nome: nome.value,
        email: email.value,
        password: password.value,
      }
    });
  };
  
  // --- Callback de Sucesso ---
  onDone(result => {
    console.log('[RegisterPage] Registro bem-sucedido!', result.data);
    // Mostra mensagem de sucesso e redireciona para login
    successMessage.value = `Usuário ${result.data?.registrar.nome} registrado com sucesso! Faça o login para continuar.`;
    // Limpa o formulário (opcional)
    nome.value = '';
    email.value = '';
    password.value = '';
  
    // Redireciona para a página de login após um pequeno delay para o usuário ver a msg
    setTimeout(() => {
      router.push('/login');
    }, 2500); // Espera 2.5 segundos
  });
  
  // --- Callback de Erro ---
  onError(error => {
    console.error('[RegisterPage] Erro no registro:', JSON.stringify(error, null, 2));
     if (error.graphQLErrors && error.graphQLErrors.length > 0) {
       // Pega a mensagem do primeiro erro GraphQL (ex: "Email já em uso", validações)
       registerError.value = error.graphQLErrors[0].message || 'Erro desconhecido do servidor.';
     } else if (error.networkError) {
       registerError.value = `Erro de rede: ${error.networkError.message}. Verifique a conexão ou o servidor backend.`;
     } else {
       registerError.value = 'Ocorreu um erro inesperado durante o registro.';
     }
  });
  
  </script>
  
  <style scoped>
  /* Estilos específicos, se necessário */
  </style>