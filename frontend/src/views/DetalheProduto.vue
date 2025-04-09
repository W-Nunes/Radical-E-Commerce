<template>
  <div class="container mx-auto p-4 lg:p-8">

    <div class="mb-6">
      <router-link to="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
        &larr; Voltar para todos os produtos
      </router-link>
    </div>

    <div v-if="carregando" class="text-center py-16">
      <p class="text-xl text-gray-500">Carregando detalhes do produto...</p>
      </div>

    <div v-else-if="erro" class="text-center py-16 bg-red-100 border border-red-400 text-vermelho-radical px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Erro ao buscar produto!</strong>
      <span class="block sm:inline"> {{ erro.message }}</span>
    </div>

    <div v-else-if="!produto && !carregando" class="text-center py-16">
       <h1 class="text-3xl font-bold mb-4 text-gray-700 dark:text-gray-300">Produto não encontrado</h1>
       <p class="text-lg text-gray-500">O produto que você procura não existe ou foi removido.</p>
    </div>

    <div v-else-if="produto" class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <img :src="produto.imagemUrlPrincipal || 'https://placehold.co/600x400/cccccc/E53E3E?text=Sem+Imagem'"
             :alt="'Imagem de ' + produto.nome"
             class="w-full rounded-lg shadow-md object-cover aspect-square" _comment="aspect-square para imagem quadrada"
        >
        </div>

      <div>
        <span class="inline-block bg-azul-radical text-white text-sm font-semibold px-3 py-1 rounded mb-3">{{ produto.categoria.nome }}</span>
        <h1 class="text-4xl lg:text-5xl font-bold mb-3 text-gray-900 dark:text-white">{{ produto.nome }}</h1>
        <p class="text-sm text-gray-500 mb-4">SKU: {{ produto.sku }}</p>

        <p class="text-3xl font-bold text-vermelho-radical mb-6">R$ {{ formatarPreco(produto.preco) }}</p>

        <div class="prose dark:prose-invert max-w-none mb-6">
             <p>{{ produto.descricao || 'Sem descrição disponível.' }}</p>
             </div>

        <div v-if="produto.emEstoque">
           <p class="text-green-600 dark:text-green-400 font-semibold mb-4">✅ Em estoque</p>
           <button
             @click="adicionarAoCarrinho(produto)"
             class="w-full sm:w-auto bg-vermelho-radical hover:bg-red-700 text-white font-bold py-3 px-8 rounded text-lg transition-colors duration-200"
           >
             Adicionar ao Carrinho
           </button>
        </div>
        <div v-else>
            <p class="text-gray-500 font-semibold mb-4">❌ Fora de estoque</p>
            <button
             class="w-full sm:w-auto bg-gray-400 text-gray-700 font-bold py-3 px-8 rounded text-lg cursor-not-allowed"
             disabled
           >
             Indisponível
           </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'; // Importa watch e computed
import { useRoute } from 'vue-router';
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';

import { useCarrinhoStore } from '@/stores/carrinho.store';

// --- Interfaces (podem ser movidas para um arquivo .d.ts depois) ---
interface Categoria {
  id: string;
  nome: string;
  slug: string;
}
interface ProdutoDetalhe { // Interface específica para os detalhes que precisamos
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  sku: string;
  imagemUrlPrincipal: string | null;
  emEstoque: boolean;
  categoria: Categoria;
  // Adicionar mais campos se necessário (ex: quantidadeEstoque)
  quantidadeEstoque: number; // Vamos precisar para o 'emEstoque'
}
interface ResultadoQueryProduto {
  produto: ProdutoDetalhe | null; // A query pode retornar null se não encontrar
}
// --------------------------------------------------------------------

// --- Lógica do Roteador ---
const route = useRoute();
// Ref reativa para o ID. null até ser pego da rota.
const idProduto = ref<string | null>(null);

// --- Definição da Query GraphQL ---
// Pede os campos necessários para a página de detalhes
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
      quantidadeEstoque # Busca a quantidade para lógica local se necessário
      categoria {
        id
        nome
        slug
      }
    }
  }
`;
// -----------------------------

// --- Lógica do Apollo useQuery ---
// Variáveis reativas para a query. Usamos computed para garantir reatividade se o ID mudar.
const variaveisQuery = computed(() => ({
    id: idProduto.value // Passa o ID da ref como variável para a query
}));

// Habilita a query apenas QUANDO idProduto.value tiver um valor (não for null)
const habilitado = computed(() => !!idProduto.value);

// Executa a query
const { result, loading: carregando, error: erro } = useQuery<ResultadoQueryProduto>(
  BUSCAR_PRODUTO_POR_ID_QUERY, // A query a ser executada
  variaveisQuery, // As variáveis reativas ({ id: ... })
  // Opções da query
  () => ({
      enabled: habilitado.value, // Só executa se habilitado for true
      fetchPolicy: 'cache-first', // Política de cache (opcional)
      // errorPolicy: 'all' // Para ver erros parciais (opcional)
  })
);

// Computada para acessar o produto do resultado de forma segura
const produto = computed(() => result.value?.produto ?? null);
// -----------------------------

// --- Lógica do Ciclo de Vida ---
// Usamos watch para pegar o ID da rota quando ela carregar ou mudar
// Isso é mais robusto que onMounted se a rota puder mudar sem recarregar o componente
watch(
  () => route.params.id, // Observa o parâmetro ID da rota
  (novoId) => {
    if (novoId) {
      // Garante que o ID seja uma string
      idProduto.value = Array.isArray(novoId) ? novoId[0] : novoId;
      console.log("ID do Produto pego da Rota:", idProduto.value);
    } else {
      idProduto.value = null; // Limpa se não houver ID
    }
  },
  { immediate: true } // Executa o watch imediatamente ao montar o componente
);

const carrinhoStore = useCarrinhoStore();
// -----------------------------

// --- Funções Auxiliares ---
function formatarPreco(valor: number): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Placeholder para adicionar ao carrinho (pode ser diferente da lista)
function adicionarAoCarrinho(item: ProdutoDetalhe): void {
  carrinhoStore.adicionarItem({
      id: item.id,
      nome: item.nome,
      preco: item.preco,
      imagemUrlPrincipal: item.imagemUrlPrincipal ?? null // Garante null se for undefined
  });
  // Chamar store Pinia/Vuex aqui
}
// -----------------------------

</script>

<style scoped>
/* Estilos com @apply do Tailwind ou CSS normal */
.prose p {
  margin-bottom: 1em; /* Exemplo de ajuste fino */
}
</style>