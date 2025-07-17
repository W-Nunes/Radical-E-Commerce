<template>
  <div>
    <header v-if="!isPromoPage" class="bg-gray-900 text-gray-200 shadow-lg sticky top-0 z-30">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center space-x-4">
        <div class="flex-shrink-0">
          <h1 class="text-xl sm:text-2xl font-bold">
            <router-link to="/" class="hover:text-azul-radical transition-colors duration-200">
              🛹Radical🛹
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
        <div v-if="isMobileMenuOpen" class="md:hidden fixed inset-0 bg-gray-900 pt-16 z-20 flex flex-col">
            <div v-if="authStore.isAuthenticated" class="text-center text-gray-300 py-2">
              Olá, {{ authStore.usuarioLogado?.nome }}!
            </div>
            
            <div class="px-6 mb-4 flex-shrink-0 flex items-center gap-2">
                <form @submit.prevent="executarBusca" class="flex-grow">
                    <input type="search" v-model="termoBusca" placeholder="Buscar..." class="w-full px-3 py-2 text-sm bg-gray-700 text-gray-200 border border-gray-600 rounded-md" />
                </form>
                <router-link v-if="authStore.isAuthenticated" @click="closeMobileMenu" to="/admin/produtos/novo" class="flex-shrink-0 bg-yellow-500 text-white rounded-md p-2 h-full flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                </router-link>
            </div>

            <div class="flex-grow overflow-y-auto px-4">
                <nav class="flex flex-col text-lg text-center text-gray-300">
                    <router-link @click="closeMobileMenu" v-for="categoria in categorias" :key="categoria.id" :to="{ name: 'Home', query: { categoria: categoria.slug } }" class="py-3 hover:text-white transition-colors duration-200">
                        {{ categoria.nome }}
                    </router-link>
                    <router-link @click="closeMobileMenu" to="/carrinho" class="py-3 mt-2 border-t border-gray-700 hover:text-white flex items-center justify-center transition-colors duration-200">
                        Meu Carrinho
                        <span v-if="carrinhoStore.totalItens > 0" class="ml-2 bg-vermelho-radical text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{{ carrinhoStore.totalItens }}</span>
                    </router-link>
                </nav>
            </div>

            <div class="flex-shrink-0 flex flex-col items-center space-y-4 px-4 py-4 mt-auto">
                 <template v-if="authStore.isAuthenticated">
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

    <footer v-if="!isPromoPage" class="bg-gray-800 text-gray-400 mt-8">
      <div class="container mx-auto flex flex-col md:flex-row justify-center md:justify-between items-center md:items-stretch text-center md:text-left min-h-screen md:min-h-0 py-12 px-6 md:py-12 md:px-6 gap-10 md:gap-4">

        <div class="w-full md:w-1/3 flex flex-col items-center md:items-start order-2 md:order-1">
          <h4 class="font-bold text-white text-lg mb-3 flex-shrink-0">Mapa do Site</h4>
          <div class="flex flex-col justify-center items-center md:items-start flex-grow w-full">
            <router-link :to="{ name: 'Home', query: { categoria: 'skates-montados' } }" class="block hover:text-white text-base py-1">Skates Montados</router-link>
            <router-link :to="{ name: 'Home', query: { categoria: 'shapes' } }" class="block hover:text-white text-base py-1">Shapes</router-link>
            <router-link :to="{ name: 'Home', query: { categoria: 'rodas' } }" class="block hover:text-white text-base py-1">Rodas</router-link>
            <router-link :to="{ name: 'Home', query: { categoria: 'trucks' } }" class="block hover:text-white text-base py-1">Trucks</router-link>
            <router-link :to="{ name: 'Home', query: { categoria: 'bmx' } }" class="block hover:text-white text-base py-1">BMX</router-link>
            <router-link :to="{ name: 'Home', query: { categoria: 'acessorios' } }" class="block hover:text-white text-base py-1">Acessórios</router-link>
          </div>
        </div>
        
        <div class="w-full md:w-1/3 text-center flex flex-col justify-center order-1 md:order-2">
          <p class="font-bold text-5xl text-white">
            <span class="hidden md:inline">🛹</span>Radical<span class="hidden md:inline">🛹</span>
          </p>
          <p class="mt-4 text-base">©<br>{{ new Date().getFullYear() }}<br> Renan W Nunes<br>Todos os direitos reservados.</p>
        </div>

        <div class="w-full md:w-1/3 flex flex-col items-center md:items-end order-3 md:order-3">
            <h4 class="font-bold text-white text-lg mb-3 flex-shrink-0">Meus Contatos</h4>
            <div class="flex flex-row md:flex-col justify-center items-center md:items-start flex-grow gap-4 md:gap-0">
              <a href="https://github.com/W-Nunes" target="_blank" class="flex items-center hover:text-white transition-colors duration-200 text-base py-1">
                <svg class="w-8 h-8 md:w-5 md:h-5 md:mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.378.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clip-rule="evenodd" /></svg>
                <span class="hidden md:inline">GitHub</span>
              </a>
              <a href="https://www.linkedin.com/in/renan-wesler-nunes-06a89a325/" target="_blank" class="flex items-center hover:text-white transition-colors duration-200 text-base py-1">
                <svg class="w-8 h-8 md:w-5 md:h-5 md:mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <span class="hidden md:inline">LinkedIn</span>
              </a>
              <a href="mailto:renanwn96@gmail.com" class="flex items-center hover:text-white transition-colors duration-200 text-base py-1">
                <svg class="w-8 h-8 md:w-5 md:h-5 md:mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>
                <span class="hidden md:inline">Gmail</span>
              </a>
              <a href="https://wa.me/5543988158876" target="_blank" class="flex items-center hover:text-white transition-colors duration-200 text-base py-1">
                 <svg class="w-8 h-8 md:w-5 md:h-5 md:mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.655 4.398 1.803 6.12l-1.141 4.168 4.264-1.117z"/></svg>
                <span class="hidden md:inline">WhatsApp</span>
              </a>
            </div>
        </div>
      </div>
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
main {
  min-height: calc(100vh - 21rem);
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