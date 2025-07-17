<template>
  <div>
    <div v-if="!termoBuscaAtual" class="bg-gray-900 text-white">
      <div class="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          A Cultura Radical Vive Aqui
        </h1>
        <p class="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
          Encontre os melhores shapes, rodas e acessórios para elevar sua session ao próximo nível.
        </p>
        <a href="#produtos" class="bg-azul-radical hover:bg-opacity-80 text-white font-bold py-3 px-8 rounded-md transition duration-200 text-lg">
          Ver Produtos
        </a>
      </div>
    </div>

    <div id="produtos" class="container mx-auto p-4">
      <div class="my-8">
        <h2 class="text-3xl font-bold mb-4 text-center text-gray-800 dark:text-gray-200">
          <span v-if="termoBuscaAtual">Resultados para "{{ termoBuscaAtual }}"</span>
          <span v-else>Produtos em Destaque</span>
        </h2>
        
        <div v-if="termoBuscaAtual && dadosPaginados && dadosPaginados.total > 1" class="flex justify-end mb-6">
          <div class="flex items-center space-x-2">
            <label for="sort-order" class="text-sm font-medium text-gray-600 dark:text-gray-400">Ordenar por:</label>
            <select
              id="sort-order"
              :value="ordenacaoAtual"
              @change="onSortChange"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-azul-radical focus:border-azul-radical sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="MAIS_RECENTES">Relevância</option>
              <option value="PRECO_ASC">Menor Preço</option>
              <option value="PRECO_DESC">Maior Preço</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="carregando" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <ProdutoCardSkeleton v-for="n in 4" :key="n" />
      </div>
      <div v-else-if="erro" class="text-center py-10 bg-red-100 dark:bg-gray-800 border border-red-400 text-vermelho-radical px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
        <strong class="font-bold block text-lg mb-2">Oops! Algo deu errado!</strong>
        <span class="block sm:inline text-sm text-red-700 dark:text-red-300"> Não conseguimos buscar os produtos. Tente novamente mais tarde.</span>
        <pre class="mt-2 text-xs text-left text-red-600 dark:text-red-400 bg-red-50 dark:bg-gray-700 p-2 rounded overflow-auto">{{ erro.message }}</pre>
      </div>

      <div v-else-if="produtosParaExibir && produtosParaExibir.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div
            v-for="produto in produtosParaExibir"
            :key="produto.id"
            class="group relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <router-link :to="{ name: 'DetalheProduto', params: { id: produto.id } }">
              <div class="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img 
                  :src="produto.imagemUrlPrincipal || 'https://placehold.co/600x400/cccccc/E53E3E?text=RadicalOne'" 
                  :alt="'Imagem de ' + produto.nome" 
                  class="w-full h-full object-cover object-center group-hover:opacity-75 transition-opacity duration-300"
                />
              </div>
            </router-link>
            
            <div class="p-4">
                <h3 class="text-sm text-gray-500 dark:text-gray-400">{{ produto.categoria.nome }}</h3>
                <router-link :to="{ name: 'DetalheProduto', params: { id: produto.id } }" class="block mt-1">
                  <p class="font-semibold text-lg text-gray-900 dark:text-white truncate group-hover:text-azul-radical transition-colors">{{ produto.nome }}</p>
                </router-link>
                <p class="mt-1 text-md font-medium text-gray-700 dark:text-gray-300">R$ {{ formatarPreco(produto.preco) }}</p>
            </div>

            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center p-4">
              <div class="flex items-center gap-2 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <router-link 
                  :to="{ name: 'DetalheProduto', params: { id: produto.id } }"
                  class="text-center text-sm bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-full shadow-lg hover:bg-gray-300 transition-colors"
                >
                  Detalhes
                </router-link>
                <button 
                  v-if="produto.emEstoque"
                  @click="adicionarAoCarrinho(produto)"
                  class="text-center text-sm bg-azul-radical text-white font-bold py-2 px-5 rounded-full shadow-lg hover:bg-opacity-80 transition-colors"
                >
                  Adicionar
                </button>
                <div v-else class="text-center text-sm bg-gray-500 text-white font-bold py-2 px-5 rounded-full cursor-not-allowed">
                  Esgotado
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="termoBuscaAtual && dadosPaginados && dadosPaginados.totalPaginas > 1" class="flex justify-center items-center mt-12 space-x-4">
          <button @click="mudarPagina(dadosPaginados.pagina - 1)" :disabled="dadosPaginados.pagina <= 1" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Anterior
          </button>
          <span>Página {{ dadosPaginados.pagina }} de {{ dadosPaginados.totalPaginas }}</span>
          <button @click="mudarPagina(dadosPaginados.pagina + 1)" :disabled="dadosPaginados.pagina >= dadosPaginados.totalPaginas" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
            Próxima
          </button>
        </div>
      </div>
      
      <div v-else class="text-center py-20 text-gray-500 dark:text-gray-400">
         <p class="text-xl mb-2">😕</p>
         <p>Nenhum produto encontrado.</p>
      </div>
    </div>
    
    <FullScreenSlider v-if="!termoBuscaAtual" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'vue-toastification';
import ProdutoCardSkeleton from './ProdutoCardSkeleton.vue';
import FullScreenSlider from './FullScreenSlider.vue';

// Interfaces
interface Categoria { id: string; nome: string; }
interface Produto { id: string; nome: string; preco: number; sku: string; imagemUrlPrincipal?: string | null; categoria: Categoria; emEstoque: boolean; quantidadeEstoque: number; }
interface ProdutoPaginado { itens: Produto[]; total: number; pagina: number; totalPaginas: number; }
interface ResultadoBusca { produtos: ProdutoPaginado; }
interface ResultadoAleatorios { produtosAleatorios: Produto[]; }

const route = useRoute();
const router = useRouter();
const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore();
const toast = useToast();

// Estado Derivado da URL 
const termoBuscaAtual = computed(() => (route.query.q as string) || '');
const paginaAtual = computed(() => Number(route.query.page || '1'));
const ordenacaoAtual = computed(() => (route.query.sort as string) || 'MAIS_RECENTES');

// Busca Paginada (ativada por termoBuscaAtual)
const BUSCAR_PRODUTOS_PAGINADOS_QUERY = gql`
  query BuscarProdutosPaginados($pagina: Int, $limite: Int, $termoBusca: String, $ordenacao: ProdutoSort) {
    produtos(pagina: $pagina, limite: $limite, termoBusca: $termoBusca, ordenacao: $ordenacao) {
      itens { id nome preco sku imagemUrlPrincipal quantidadeEstoque emEstoque categoria { id nome } }
      total
      pagina
      totalPaginas
    }
  }
`;
const { 
  result: resultadoBusca, 
  loading: loadingBusca, 
  error: erroBusca 
} = useQuery<ResultadoBusca>(
  BUSCAR_PRODUTOS_PAGINADOS_QUERY,
  () => ({
    pagina: paginaAtual.value,
    limite: 4,
    termoBusca: termoBuscaAtual.value,
    ordenacao: ordenacaoAtual.value,
  }),
  { 
    enabled: computed(() => !!termoBuscaAtual.value),
    fetchPolicy: 'cache-and-network' 
  }
);
const dadosPaginados = computed(() => resultadoBusca.value?.produtos);

// Produtos Aleatórios (ativada quando NÃO há busca)
const BUSCAR_PRODUTOS_ALEATORIOS_QUERY = gql`
  query BuscarProdutosAleatorios($limite: Int) {
    produtosAleatorios(limite: $limite) {
      id nome preco sku imagemUrlPrincipal quantidadeEstoque emEstoque categoria { id nome }
    }
  }
`;
const { 
  result: resultadoAleatorios, 
  loading: loadingAleatorios, 
  error: erroAleatorios 
} = useQuery<ResultadoAleatorios>(
  BUSCAR_PRODUTOS_ALEATORIOS_QUERY,
  { limite: 4 },
  {
    enabled: computed(() => !termoBuscaAtual.value),
  }
);

const carregando = computed(() => loadingBusca.value || loadingAleatorios.value);
const erro = computed(() => erroBusca.value || erroAleatorios.value);
const produtosParaExibir = computed(() => {
  return termoBuscaAtual.value ? dadosPaginados.value?.itens : resultadoAleatorios.value?.produtosAleatorios;
});

function mudarPagina(novaPagina: number) {
  router.push({ query: { ...route.query, page: novaPagina } });
}

function onSortChange(event: Event) {
  const newSort = (event.target as HTMLSelectElement).value;
  router.push({ query: { ...route.query, sort: newSort, page: 1 } });
}


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

