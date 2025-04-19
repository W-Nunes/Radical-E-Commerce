<template>
  <div class="container mx-auto p-4 lg:p-8">

    <div class="mb-6">
      <router-link to="/" class="text-azul-radical hover:underline dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center group">
         <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"> <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /> </svg>
        Voltar para todos os produtos
      </router-link>
    </div>

    <div v-if="carregando" class="text-center py-20">
      <p class="text-xl text-gray-500 dark:text-gray-400 animate-pulse">Carregando detalhes...</p>
      </div>

    <div v-else-if="erro" class="text-center py-10 bg-red-100 dark:bg-gray-800 border border-red-400 dark:border-red-700 text-vermelho-radical px-4 py-3 rounded relative max-w-lg mx-auto" role="alert">
       <strong class="font-bold block text-lg mb-2">Erro ao buscar produto!</strong>
       <span class="block sm:inline text-sm text-red-700 dark:text-red-300"> {{ erro.message }}</span>
    </div>

    <div v-else-if="!produto && !carregando" class="text-center py-20">
       <h1 class="text-3xl font-bold mb-4 text-gray-700 dark:text-gray-300">Produto não encontrado</h1>
       <p class="text-lg text-gray-500 dark:text-gray-400">O produto que você procura não existe ou foi removido.</p>
    </div>

    <div v-else-if="produto" class="md:grid md:grid-cols-5 md:gap-8 lg:gap-12">

      <div class="md:col-span-2 mb-6 md:mb-0">
        <img :src="produto.imagemUrlPrincipal || 'https://placehold.co/600x600/cccccc/E53E3E?text=RadicalOne'"
             :alt="'Imagem de ' + produto.nome"
             class="w-full rounded-lg shadow-lg object-cover aspect-square border border-gray-200 dark:border-gray-700"
             loading="lazy"
        />
        </div>

      <div class="md:col-span-3 flex flex-col">
        <span class="text-sm font-semibold uppercase tracking-wider text-vermelho-radical dark:text-vermelho-radical/90 mb-2 block">{{ produto.categoria.nome }}</span> <h1 class="text-3xl lg:text-4xl font-bold mb-2 text-gray-900 dark:text-white leading-tight">{{ produto.nome }}</h1>
        <p class="text-xs text-gray-500 dark:text-gray-400 mb-4">SKU: {{ produto.sku }}</p>

        <p class="text-4xl font-extrabold text-azul-radical dark:text-azul-radical mb-6">R$ {{ formatarPreco(produto.preco) }}</p>

        <h2 class="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 mt-4">Descrição</h2>
        <div class="prose prose-sm sm:prose-base dark:prose-invert max-w-none mb-6 text-gray-700 dark:text-gray-300">
            <p>{{ produto.descricao || 'Sem descrição disponível.' }}</p>
        </div>

        <div class="flex-grow"></div>

        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div class="mb-4 flex items-center">
                <template v-if="produto.emEstoque && produto.quantidadeEstoque > 0">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /> </svg>
                    <span class="text-green-600 dark:text-green-400 font-semibold">Em estoque</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400 ml-2">({{ produto.quantidadeEstoque }} disponíveis)</span>
                </template>
                <template v-else>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /> </svg>
                    <span class="text-red-600 dark:text-red-400 font-semibold">Fora de estoque</span>
                </template>
            </div>

            <div v-if="produto.emEstoque && produto.quantidadeEstoque > 0" class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded self-start">
                    <button @click="decrementarQuantidade" :disabled="quantidade <= 1" class="px-3 h-10 text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-l transition-colors">-</button>
                    <input type="number" v-model.number="quantidade" min="1" :max="produto.quantidadeEstoque" class="w-12 h-10 text-center border-x border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none text-gray-900 dark:text-white">
                    <button @click="incrementarQuantidade" :disabled="quantidade >= produto.quantidadeEstoque" class="px-3 h-10 text-lg font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-r transition-colors">+</button>
                </div>
                <button
                    @click="adicionarAoCarrinho(produto)"
                    :disabled="quantidade > produto.quantidadeEstoque"
                    class="flex-grow bg-vermelho-radical hover:bg-opacity-80 text-white font-bold py-2 px-6 rounded text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-vermelho-radical disabled:opacity-50 disabled:cursor-not-allowed h-10 flex items-center justify-center"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"> <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /> </svg>
                    Adicionar
                </button>
            </div>

            <div v-else class="mt-4">
                <button
                    class="w-full sm:w-auto bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-bold py-3 px-8 rounded text-lg cursor-not-allowed"
                    disabled
                >
                    Indisponível
                </button>
            </div>
        </div> </div> </div> </div> </template>

<script setup lang="ts">
// --- SEU SCRIPT SETUP CORRIGIDO ---
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';
import { useCarrinhoStore } from '@/stores/carrinho.store'; // Importar tipo se necessário
import { useToast } from 'vue-toastification';

// --- Interfaces ---
interface Categoria { id: string; nome: string; slug: string; }
interface ProdutoDetalhe {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  sku: string;
  imagemUrlPrincipal: string | null;
  emEstoque: boolean;
  quantidadeEstoque: number;
  categoria: Categoria;
}
interface ResultadoQueryProduto { produto: ProdutoDetalhe | null; }
// -----------------

const route = useRoute();
const idProduto = ref<string | null>(null);
const carrinhoStore = useCarrinhoStore();
const toast = useToast();
const quantidade = ref(1); // Estado para quantidade

// --- Query ---
const BUSCAR_PRODUTO_POR_ID_QUERY = gql`
  query BuscarProdutoPorId($id: ID!) {
    produto(id: $id) {
      id
      nome
      descricao
      preco
      sku
      imagemUrlPrincipal
      emEstoque
      quantidadeEstoque
      categoria {
        id
        nome
        slug
      }
    }
  }
`;
// -------------

// --- Apollo ---
const variaveisQuery = computed(() => ({ id: idProduto.value }));
const habilitado = computed(() => !!idProduto.value);
const { result, loading: carregando, error: erro } = useQuery<ResultadoQueryProduto>(
  BUSCAR_PRODUTO_POR_ID_QUERY,
  variaveisQuery,
  () => ({ enabled: habilitado.value, fetchPolicy: 'cache-and-network' })
);
const produto = computed(() => result.value?.produto ?? null);
// --------------

// --- Watch ID ---
watch(
  () => route.params.id,
  (novoId) => {
    if (novoId && typeof novoId === 'string') { // Garante que é string
      quantidade.value = 1; // Reseta quantidade
      idProduto.value = novoId;
    } else if (novoId && Array.isArray(novoId)) { // Se vier como array (menos comum)
      quantidade.value = 1;
      idProduto.value = novoId[0];
    }
     else {
      idProduto.value = null;
    }
  },
  { immediate: true }
);
// --------------

// --- Funções ---
function formatarPreco(valor: number): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function adicionarAoCarrinho(item: ProdutoDetalhe | null): void {
  if (!item) return;

  // Adapta para a interface ProdutoParaCarrinho esperada pelo store
  const produtoParaStore: ProdutoParaCarrinho = {
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      imagemUrlPrincipal: item.imagemUrlPrincipal ?? null
  };

  console.log(`[DetalheProduto] Adicionando ${quantidade.value}x "${item.nome}"...`);
  for (let i = 0; i < quantidade.value; i++) {
      carrinhoStore.adicionarItem(produtoParaStore); // Chama com 1 argumento
  }

  toast.success(`${quantidade.value}x "${item.nome}" adicionado(s) ao carrinho!`); // Usa toast
  quantidade.value = 1; // Reseta quantidade
}

function incrementarQuantidade() {
  // Garante que produto.value e quantidadeEstoque existem e são números
  if (produto.value?.quantidadeEstoque && quantidade.value < produto.value.quantidadeEstoque) {
    quantidade.value++;
  }
}

function decrementarQuantidade() {
  if (quantidade.value > 1) {
    quantidade.value--;
  }
}
// -------------
</script>

<style scoped>
.prose p:last-child {
  margin-bottom: 0;
}
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>