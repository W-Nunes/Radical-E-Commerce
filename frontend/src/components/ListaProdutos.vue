<template>
  <div class="container mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6 text-center text-azul-radical">Nossos Produtos Radicais!</h1>

    <div v-if="carregando" class="text-center py-10 text-gray-500">
      <p>Buscando produtos...</p>
    </div>

    <div v-else-if="erro"
      class="text-center py-10 bg-red-100 border border-red-400 text-vermelho-radical px-4 py-3 rounded relative"
      role="alert">
      <strong class="font-bold">Oops! Algo deu errado!</strong>
      <span class="block sm:inline"> Não conseguimos buscar os produtos. {{ erro.message }}</span>
    </div>

    <div v-else-if="resultado?.produtos && resultado.produtos.length > 0"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

      <router-link
        v-for="produto in resultado.produtos"
        :key="produto.id"
        :to="{ name: 'DetalheProduto', params: { id: produto.id } }" 
        class="no-underline hover:opacity-90" _
      >
        <div
            class="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col h-full"
        >
            <img :src="produto.imagemUrlPrincipal || 'https://placehold.co/600x400/cccccc/E53E3E?text=Sem+Imagem'" :alt="'Imagem de ' + produto.nome" class="w-full h-48 object-cover">
            <div class="p-4 flex flex-col flex-grow">
                <span class="text-sm font-medium text-azul-radical mb-1">{{ produto.categoria.nome }}</span>
                <h3 class="font-semibold text-lg mb-2 flex-grow text-gray-900" :title="produto.nome">{{ produto.nome }}</h3>
                <p class="text-gray-500 text-xs mb-2">SKU: {{ produto.sku }}</p>
                <p class="text-gray-900 font-bold text-2xl mb-4">R$ {{ formatarPreco(produto.preco) }}</p>

                <button
                    v-if="produto.emEstoque"
                    @click.prevent="adicionarAoCarrinho(produto)" 
                    class="mt-auto w-full bg-vermelho-radical hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 z-10 relative" 
                >
                    Adicionar ao Carrinho
                </button>

                <p v-else class="mt-auto text-center text-sm text-gray-500 py-2">Produto Indisponível</p>
            </div>
        </div>
      </router-link> </div>

    <div v-else class="text-center py-10 text-gray-500">
      <p>Nenhum produto encontrado no momento.</p>
    </div>

  </div>
</template>

<script setup lang="ts">
// Importa o necessário do Apollo Composable
import { useQuery } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';

// Define as interfaces para tipagem forte (espelham os DTOs do backend)
interface Categoria {
  id: string;
  nome: string;
  slug: string;
}
interface Produto {
  id: string;
  nome: string;
  preco: number;
  sku: string;
  imagemUrlPrincipal?: string; // Mantido opcional aqui
  categoria: Categoria; // Categoria aninhada
  emEstoque: boolean; // Campo calculado
  // Adicionar descricao aqui se a query buscar, mesmo que não use neste template
  descricao?: string | null;
}
interface ResultadoQueryProdutos {
  produtos: Produto[]; // A query retorna um array de produtos
}

// Define a query GraphQL usando gql tag
const BUSCAR_PRODUTOS_QUERY = gql`
    query BuscarTodosProdutosComCategoria {
      produtos {
        id
        nome
        descricao # Mesmo que não usemos no template, podemos buscar
        preco
        sku
        imagemUrlPrincipal
        emEstoque # Campo calculado no resolver
        categoria {
          id
          nome
          slug
        }
      }
    }
  `

// Executa a query ao montar o componente
const { result: resultado, loading: carregando, error: erro } = useQuery<ResultadoQueryProdutos>(BUSCAR_PRODUTOS_QUERY);

// Função auxiliar para formatar o preço
function formatarPreco(valor: number): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função placeholder para adicionar ao carrinho
function adicionarAoCarrinho(produto: Produto): void {
  console.log('Adicionando produto ao carrinho (implementar lógica):', produto.nome);
  // Aqui você chamaria uma mutation do Apollo, ou uma action do Pinia/Vuex, etc.
  alert(`Produto ${produto.nome} adicionado! (Simulação)`);
}
</script>

<style scoped>
/* Estilos específicos podem ser adicionados aqui, se Tailwind não for suficiente */
</style>