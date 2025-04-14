<template>
  <div> <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 class="text-xl sm:text-2xl font-bold"> <router-link to="/">🛹 Loja Radical 🤘</router-link>
      </h1>

      <div class="flex items-center space-x-4 sm:space-x-6">
        <nav class="flex items-center space-x-2 sm:space-x-4">
          <span class="text-sm sm:text-base hidden sm:inline"> 🛒 ({{ carrinhoStore.totalItens }})
          </span>
          <router-link to="/carrinho" class="hover:text-gray-300 text-sm sm:text-base whitespace-nowrap">
             Ver Carrinho
             <span v-if="carrinhoStore.totalItens > 0" class="ml-1 inline-block bg-red-500 text-white text-xs rounded-full h-4 w-4 text-center leading-4">
                {{ carrinhoStore.totalItens }}
             </span>
          </router-link>
        </nav>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm hidden md:inline">Olá, {{ authStore.usuarioLogado?.nome }}!</span>
            <button
              @click="executarLogout"
              class="bg-red-500 hover:bg-red-700 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline"
            >
              Sair
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="hover:text-gray-300 text-sm">Login</router-link>
            <router-link to="/registrar" class="bg-blue-500 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline">Registrar</router-link>
          </template>
          </div>

      </div>
    </header>

    <main class="p-4"> <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-gray-200 text-gray-700 p-4 text-center mt-8">
        © {{ new Date().getFullYear() }} Loja Radical - Todos os direitos reservados.
      </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'; // <<< 1. Importar useRouter
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store'; // <<< 2. Importar useAuthStore

const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore(); // <<< 3. Obter instância do authStore
const router = useRouter();   // <<< 4. Obter instância do router

// <<< 5. Adicionar função de Logout
const executarLogout = () => {
  console.log('[App] Executando logout...');
  authStore.limparAuthData(); // Limpa o store (e localStorage)
  router.push('/'); // Redireciona para a Home após logout
};
</script>

<style scoped>
/* Estilos específicos para o layout do App, se necessário */
main {
  min-height: calc(100vh - 10rem); /* Exemplo para empurrar o footer para baixo */
}

/* Estilos para transição de página (opcional) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>