<template>
  <div>
    <header v-if="!isPromoPage" class="bg-gray-900 text-gray-200 shadow-lg sticky top-0 z-30">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center space-x-4">
        <div class="flex-shrink-0">
          <h1 class="text-xl sm:text-2xl font-bold">
            <router-link to="/" class="hover:text-azul-radical transition-colors duration-200">
              Radical 🛹
            </router-link>
          </h1>
        </div>
        
        <div class="flex-1 min-w-0 hidden md:block">
          <form @submit.prevent="executarBusca" class="max-w-xl mx-auto">
            <input
              type="search"
              v-model="termoBusca"
              placeholder="Buscar por produtos..."
              class="w-full px-3 py-1.5 text-sm bg-gray-700 text-gray-200 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-azul-radical"
            />
          </form>
        </div>

        <div class="flex-shrink-0 hidden md:flex items-center justify-end space-x-2 sm:space-x-4">
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm hidden lg:inline">Olá, {{ authStore.usuarioLogado?.nome }}!</span>
            <button @click="executarLogout" class="bg-vermelho-radical hover:bg-opacity-80 transition-colors duration-200 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline">
              Sair
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="bg-white text-azul-radical hover:bg-gray-200 text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline transition-colors duration-200">
              Entrar
            </router-link>
            <router-link to="/registrar" class="bg-azul-radical hover:bg-opacity-80 transition-colors duration-200 text-white text-xs sm:text-sm font-bold py-1 px-2 sm:px-3 rounded focus:outline-none focus:shadow-outline">
              Registrar
            </router-link>
          </template>
        </div>

        <div class="md:hidden flex items-center">
          <button @click="toggleMobileMenu" class="text-gray-200 focus:outline-none z-30">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <nav class="hidden md:flex bg-white text-gray-800 shadow-inner">
        <div class="container mx-auto px-4 py-2 flex justify-between items-center text-sm font-medium space-x-4">
           <div class="flex-shrink-0 text-center">
             <span class="text-gray-500 hidden lg:block">Calcule o frete</span>
           </div>
           <div class="flex-1 min-w-0 flex justify-center items-center space-x-4 xl:space-x-6">
             <router-link v-for="categoria in categorias" :key="categoria.id" :to="{ name: 'Home', query: { categoria: categoria.slug } }" class="text-gray-600 hover:text-azul-radical transition-colors duration-200 whitespace-nowrap">
               {{ categoria.nome }}
             </router-link>
             <router-link v-if="authStore.isAuthenticated" to="/admin/produtos/novo" class="text-yellow-600 hover:text-yellow-500 transition-colors duration-200 text-xs whitespace-nowrap">
               + Criar Produto
             </router-link>
           </div>
           <div class="flex-shrink-0 flex justify-end">
             <router-link to="/carrinho" class="flex items-center text-gray-600 hover:text-azul-radical transition-colors duration-200">
               <span class="text-2xl mr-1">🛒</span>
               <span class="hidden lg:inline"> ({{ carrinhoStore.totalItens }})</span>
               <span class="ml-2 hidden sm:inline">Ver Carrinho</span>
               <span v-if="carrinhoStore.totalItens > 0" class="sm:ml-2 inline-block bg-vermelho-radical text-white text-xs rounded-full h-5 w-5 text-center leading-5 animate-pulse">
                 {{ carrinhoStore.totalItens }}
               </span>
             </router-link>
           </div>
        </div>
      </nav>
    </header>

    <transition name="slide-fade">
        <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 bg-gray-900 pt-20 z-20 flex flex-col">
            <div class="px-6 mb-4 flex-shrink-0">
                <form @submit.prevent="executarBusca">
                    <input type="search" v-model="termoBusca" placeholder="Buscar..." class="w-full px-3 py-2 text-sm bg-gray-700 text-gray-200 border border-gray-600 rounded-md" />
                </form>
            </div>
            <div class="flex-grow overflow-y-auto px-4">
                <nav class="flex flex-col text-lg text-center text-gray-300 divide-y divide-gray-700">
                    <router-link @click="closeMobileMenu" v-for="categoria in categorias" :key="categoria.id" :to="{ name: 'Home', query: { categoria: categoria.slug } }" class="py-3 hover:text-white transition-colors duration-200">
                        {{ categoria.nome }}
                    </router-link>
                    <router-link @click="closeMobileMenu" v-if="authStore.isAuthenticated" to="/admin/produtos/novo" class="py-3 text-yellow-500 hover:text-yellow-300 transition-colors duration-200">
                        + Criar Produto
                    </router-link>
                    <router-link @click="closeMobileMenu" to="/carrinho" class="py-3 hover:text-white flex items-center justify-center transition-colors duration-200">
                        Meu Carrinho
                        <span v-if="carrinhoStore.totalItens > 0" class="ml-2 bg-vermelho-radical text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{{ carrinhoStore.totalItens }}</span>
                    </router-link>
                </nav>
            </div>
            <div class="flex-shrink-0 flex flex-col items-center space-y-4 px-4 py-4 mt-auto">
                 <template v-if="authStore.isAuthenticated">
                    <span class="text-base">Olá, {{ authStore.usuarioLogado?.nome }}!</span>
                    <button @click="executarLogout" class="w-full max-w-xs bg-vermelho-radical hover:bg-opacity-80 transition-colors duration-200 text-white font-bold py-2 px-4 rounded">Sair</button>
                </template>
                <template v-else>
                    <router-link @click="closeMobileMenu" to="/login" class="w-full max-w-xs text-center bg-gray-700 hover:bg-gray-600 transition-colors duration-200 text-white font-bold py-2 px-4 rounded">Login</router-link>
                    <router-link @click="closeMobileMenu" to="/registrar" class="w-full max-w-xs text-center bg-azul-radical hover:bg-opacity-80 transition-colors duration-200 text-white font-bold py-2 px-4 rounded">Registrar</router-link>
                </template>
            </div>
        </div>
    </transition>
    
    <main :class="{ 'p-4': !isPromoPage }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer v-if="!isPromoPage" class="bg-gray-800 text-gray-400 p-4 text-center mt-8 text-xs">
      © {{ new Date().getFullYear() }} Loja Radical - Todos os direitos reservados.
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'vue-toastification';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import type { CategoriaOutput } from '@/types/categoria.output';

const route = useRoute();
const router = useRouter();
const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore();
const toast = useToast();

// Propriedade computada para verificar se estamos na página de promoção
const isPromoPage = computed(() => route.name === 'Promocao');

const termoBusca = ref('');
const isMobileMenuOpen = ref(false);

const CATEGORIAS_QUERY = gql`
  query BuscarCategoriasMenu {
    categorias {
      id
      nome
      slug
    }
  }
`;

const { result: categoriasResult } = useQuery<{ categorias: CategoriaOutput[] }>(CATEGORIAS_QUERY);
const categorias = computed(() => categoriasResult.value?.categorias ?? []);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const executarBusca = () => {
  if (termoBusca.value.trim()) {
    router.push({ name: 'Home', query: { q: termoBusca.value } });
    closeMobileMenu();
  }
};

const executarLogout = () => {
  authStore.limparAuthData();
  toast.info('Logout realizado com sucesso!');
  closeMobileMenu();
  router.push('/');
};
</script>

<style scoped>
/* O CSS scoped permanece o mesmo */
main {
  min-height: calc(100vh - 12rem);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>