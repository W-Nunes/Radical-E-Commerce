<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">
      <span v-if="termoBuscaAtual">Buscando por "{{ termoBuscaAtual }}"</span>
      <span v-else>Nossos Produtos <span class="text-azul-radical">Radicais!</span> 🤘</span>
    </h1>

    <div v-if="carregando" class="text-center py-20">
      <p class="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Buscando produtos...</p>
    </div>

    <div v-else-if="erro"
         class="text-center py-10 bg-red-100 dark:bg-gray-800 border border-red-400 dark:border-red-700 text-vermelho-radical px-4 py-3 rounded relative max-w-lg mx-auto"
         role="alert">
      <strong class="font-bold block text-lg mb-2">Oops! Algo deu errado!</strong>
      <span class="block sm:inline text-sm text-red-700 dark:text-red-300"> Não conseguimos buscar os produtos. Tente novamente mais tarde.</span>
      <pre class="mt-2 text-xs text-left text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 p-2 rounded overflow-auto">{{ erro.message }}</pre>
    </div>

    <div v-else-if="dadosPaginados?.itens && dadosPaginados.itens.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        <router-link
          v-for="produto in dadosPaginados.itens"
          :key="produto.id"
          :to="{ name: 'DetalheProduto', params: { id: produto.id } }"
          class="group block no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-azul-radical rounded-lg" >
          <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 group-hover:border-azul-radical/70 transition-all duration-300 ease-in-out flex flex-col h-full">
            <div class="overflow-hidden relative">
              <img :src="produto.imagemUrlPrincipal || 'https://placehold.co/600x400/cccccc/E53E3E?text=RadicalOne'"
                   :alt="'Imagem de ' + produto.nome"
                   class="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" loading="lazy"
              />
              <span class="absolute top-2 left-2 bg-vermelho-radical text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                {{ produto.categoria.nome }}
              </span>
            </div>
            <div class="p-4 flex flex-col flex-grow">
              <h3 class="font-bold text-lg mb-2 flex-grow text-gray-900 dark:text-white group-hover:text-azul-radical transition-colors duration-200 line-clamp-2" :title="produto.nome">
                {{ produto.nome }}
              </h3>
              <p class="text-gray-500 dark:text-gray-400 text-xs mb-2">SKU: {{ produto.sku }}</p>
              <p class="text-gray-900 dark:text-white font-bold text-2xl mb-4">R$ {{ formatarPreco(produto.preco) }}</p>
              <div class="mt-auto pt-2">
                <button
                  v-if="produto.emEstoque"
                  @click.prevent.stop="adicionarAoCarrinho(produto)"
                  class="w-full bg-azul-radical hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-azul-radical flex items-center justify-center text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"> <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /> </svg>
                  Adicionar
                </button>
                <p v-else class="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 py-2 px-4 border border-dashed border-gray-300 dark:border-gray-600 rounded">
                  Indisponível
                </p>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="dadosPaginados.totalPaginas > 1" class="flex justify-center items-center mt-12 space-x-4">
        <button
          @click="mudarPagina(dadosPaginados.pagina - 1)"
          :disabled="dadosPaginados.pagina <= 1"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
          Anterior
        </button>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          Página {{ dadosPaginados.pagina }} de {{ dadosPaginados.totalPaginas }}
        </span>
        <button
          @click="mudarPagina(dadosPaginados.pagina + 1)"
          :disabled="dadosPaginados.pagina >= dadosPaginados.totalPaginas"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
          Próxima
        </button>
      </div>
    </div>
    
    <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">
      <p class="text-xl mb-2">😕</p>
      <p>Nenhum produto encontrado.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'vue-toastification';

// --- Interfaces para tipagem ---
interface Categoria { id: string; nome: string; }
interface Produto {
  id: string;
  nome: string;
  preco: number;
  sku: string;
  imagemUrlPrincipal?: string | null;
  categoria: Categoria;
  emEstoque: boolean;
  quantidadeEstoque: number;
}
interface ProdutoPaginado {
  itens: Produto[];
  total: number;
  pagina: number;
  totalPaginas: number;
}
interface ResultadoQuery { produtos: ProdutoPaginado; }

// --- Hooks e Stores ---
const route = useRoute();
const router = useRouter();
const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore();
const toast = useToast();

// --- Reatividade para os parâmetros da Query da URL ---
const paginaAtual = computed(() => Number(route.query.page || '1'));
const termoBuscaAtual = computed(() => (route.query.q as string) || null); // <-- Altere para retornar null se vazio

// --- Query GraphQL com Paginação e Busca ---
const BUSCAR_PRODUTOS_QUERY = gql`
  query BuscarProdutos($pagina: Int, $limite: Int, $termoBusca: String) {
    produtos(pagina: $pagina, limite: $limite, termoBusca: $termoBusca) {
      itens {
        id
        nome
        preco
        sku
        imagemUrlPrincipal
        quantidadeEstoque
        emEstoque
        categoria { id nome }
      }
      total
      pagina
      totalPaginas
    }
  }
`;

// --- useQuery com variáveis reativas ---
const { result, loading: carregando, error: erro, refetch } = useQuery<ResultadoQuery>(
  BUSCAR_PRODUTOS_QUERY,
  () => ({
    pagina: paginaAtual.value,
    limite: 4,
    // AQUI ESTÁ A CORREÇÃO:
    // Se o termo de busca for nulo ou uma string vazia, a variável 'termoBusca' não será enviada na requisição,
    // fazendo com que o backend retorne todos os produtos.
    termoBusca: termoBuscaAtual.value || undefined,
  }),
  {
    fetchPolicy: 'cache-and-network',
  }
);

const dadosPaginados = computed(() => result.value?.produtos);

// --- Funções ---
function mudarPagina(novaPagina: number) {
  router.push({ query: { ...route.query, page: novaPagina } });
}

watch(() => route.query.q, () => {
  if (paginaAtual.value !== 1) {
    router.push({ query: { ...route.query, page: 1 } });
  } else {
    refetch();
  }
});

function formatarPreco(valor: number): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function adicionarAoCarrinho(produto: Produto): void {
  if (!authStore.isAuthenticated) {
    toast.warning('Faça login para adicionar produtos ao carrinho!');
    router.push({ name: 'Login' });
    return;
  }
  carrinhoStore.adicionarItem(produto.id, 1);
  toast.success(`"${produto.nome}" adicionado ao carrinho!`);
}
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>