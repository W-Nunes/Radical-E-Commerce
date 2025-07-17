<template>
  <div class="container mx-auto p-4 max-w-lg">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">Criar Conta na RadicalOne</h1>
    <form @submit.prevent="handleRegister" class="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 mb-4">
      <div class="mb-4">
        <label for="nome" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          Nome:
        </label>
        <input
          id="nome"
          v-model="nome"
          type="text"
          required
          placeholder="Seu nome completo"
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
          />
      </div>
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
          placeholder="Mínimo 6 caracteres"
          class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
           />
         </div>
      <div class="pt-2">
        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-azul-radical hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-azul-radical disabled:opacity-60 disabled:cursor-not-allowed"
          >
          <span v-if="loading">Registrando...</span>
          <span v-else>Criar Conta</span>
        </button>
      </div>
      <div class="text-center mt-6">
        <router-link
          to="/login"
          class="text-sm font-medium text-azul-radical hover:underline dark:text-blue-400"
        >
          Já tem conta? Entrar
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
import type { UserOutput } from '@/types/user.output';
import { useToast } from 'vue-toastification'; 

// Refs
const nome = ref('');
const email = ref('');
const password = ref('');

// Instâncias
const router = useRouter();
const toast = useToast(); //

// GraphQL
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

// Apollo
const {
  mutate: executarRegistro,
  loading,
  onDone,
  onError,
} = useMutation< { registrar: UserOutput } >(REGISTER_MUTATION);

// Handler
const handleRegister = () => {
  console.log('[RegisterPage] Tentando registrar com:', nome.value, email.value);
  executarRegistro({
    dadosRegistro: {
      nome: nome.value,
      email: email.value,
      password: password.value,
    }
  });
};

// Callbacks
onDone(result => {
  console.log('[RegisterPage] Registro bem-sucedido!', result.data);
  toast.success(`Usuário ${result.data?.registrar.nome} registrado! Faça o login.`); // Usa toast
  nome.value = '';
  email.value = '';
  password.value = '';
  setTimeout(() => {
    router.push('/login');
  }, 2500);
});

onError(error => {
  console.error('[RegisterPage] Erro no registro:', error);
  let message = 'Ocorreu um erro inesperado durante o registro.';
   if (error.graphQLErrors && error.graphQLErrors.length > 0) {
     message = error.graphQLErrors[0].message || message;
   } else if (error.networkError) {
     message = `Erro de rede: ${error.networkError.message}.`;
   }
   toast.error(message); // Usa toast
});

</script>

<style scoped>

</style>