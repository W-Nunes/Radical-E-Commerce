<template>
  <div>
    <header class="bg-gray-900   text-gray-200 p-4 flex justify-between items-center shadow-lg">
      <h1 class="text-xl sm:text-2xl font-bold">
        <router-link to="/" class="hover:text-azul-radical transition-colors duration-200">🛹 Loja Radical 🤘</router-link>
      </h1>

      <div class="flex items-center space-x-4 sm:space-x-6">
        <nav class="flex items-center space-x-2 sm:space-x-4">
          <span class="text-sm sm:text-base hidden sm:inline">
             🛒 ({{ carrinhoStore.totalItens }})
          </span>
          <router-link to="/carrinho" class="hover:text-azul-radical text-sm sm:text-base whitespace-nowrap transition-colors duration-200">
             Ver Carrinho
             <span v-if="carrinhoStore.totalItens > 0" class="ml-1 inline-block bg-vermelho-radical text-white text-xs rounded-full h-4 w-4 text-center leading-4 animate-pulse"> {{ carrinhoStore.totalItens }}
             </span>
          </router-link>
          <router-link
            v-if="authStore.isAuthenticated"
            to="/admin/produtos/novo"
            class="text-sm ml-4 text-yellow-500 hover:text-yellow-300 transition-colors duration-200"
          >
            Criar Produto
          </router-link>
        </nav>

        <div class="flex items-center space-x-2 sm:space-x-4">
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm hidden md:inline">Olá, {{ authStore.usuarioLogado?.nome }}!</span>
            <button
              @click="executarLogout"
              class="bg-vermelho-radical hover:bg-opacity-80 transition-colors duration-200 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline"
            >
              Sair
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="hover:text-azul-radical text-sm transition-colors duration-200">Login</router-link>
            <router-link
              to="/registrar"
              class="bg-azul-radical hover:bg-opacity-80 transition-colors duration-200 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline"
              >Registrar
            </router-link>
          </template>
        </div>

      </div>
    </header>

    <main class="p-4">
       <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-gray-800 text-gray-400 p-4 text-center mt-8 text-xs"> © {{ new Date().getFullYear() }} Loja Radical - Todos os direitos reservados.
     </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'vue-toastification'; // <<< 1. IMPORTAR useToast

const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast(); // <<< 2. OBTER instância do toast

const executarLogout = () => {
  console.log('[App] Executando logout...');
  authStore.limparAuthData();
  toast.info('Logout realizado com sucesso!'); // <<< 3. CHAMAR toast AQUI
  router.push('/');
};

</script>

<style scoped>
/* SEU CSS SCOPED CONTINUA O MESMO */
main {
  min-height: calc(100vh - 10rem);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>