<template>
    <div class="container mx-auto p-4 lg:p-8">
      <h1 class="text-3xl font-bold mb-6">Meu Carrinho</h1>
  
      <div v-if="carrinhoStore.listaItens.length === 0" class="text-center py-16">
        <p class="text-xl text-gray-500">Seu carrinho está vazio.</p>
        <router-link to="/" class="mt-4 inline-block bg-azul-radical text-white font-semibold py-2 px-6 rounded hover:opacity-90">
          Continuar Comprando
        </router-link>
      </div>
  
      <div v-else>
        <div class="space-y-4 mb-8">
          <div v-for="item in carrinhoStore.listaItens" :key="item.id" class="flex items-center border-b pb-4">
            <img :src="item.imagemUrlPrincipal || 'https://placehold.co/100x100/cccccc/E53E3E?text=Sem+Img'" :alt="item.nome" class="w-20 h-20 object-cover rounded mr-4">
  
            <div class="flex-grow">
              <h3 class="font-semibold text-lg">{{ item.nome }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">Preço Unitário: R$ {{ formatarPreco(item.preco) }}</p>
            </div>
  
            <div class="flex items-center mx-4">
              <button @click="atualizarQtde(item.id, item.quantidade - 1)" class="px-2 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700">-</button>
              <input
                type="number"
                :value="item.quantidade"
                @input="atualizarQtdeInput(item.id, $event)"
                min="1"
                class="w-12 text-center border-t border-b mx-1 dark:bg-gray-800"
              >
              <button @click="atualizarQtde(item.id, item.quantidade + 1)" class="px-2 py-1 border rounded hover:bg-gray-200 dark:hover:bg-gray-700">+</button>
            </div>
  
            <div class="w-28 text-right font-semibold mx-4">
              R$ {{ formatarPreco(item.preco * item.quantidade) }}
            </div>
  
            <button @click="carrinhoStore.removerItem(item.id)" class="text-red-500 hover:text-red-700 ml-4" title="Remover Item">
              🗑️
            </button>
          </div>
        </div>
  
        <div class="text-right">
          <h2 class="text-2xl font-bold">Total: <span class="text-vermelho-radical">R$ {{ formatarPreco(carrinhoStore.valorTotal) }}</span></h2>
          <button class="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded text-lg">
            Finalizar Compra (WIP)
          </button>
           <button @click="carrinhoStore.limparCarrinho()" class="mt-4 ml-2 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
              Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useCarrinhoStore } from '@/stores/carrinho.store';
  
  // Obtém a instância do store do carrinho
  const carrinhoStore = useCarrinhoStore();
  
  // Função auxiliar para formatar preço (poderia vir de um utils)
  function formatarPreco(valor: number): string {
    if (typeof valor !== 'number') return '0,00';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  // Função para chamar a action de atualizar quantidade (botões +/-)
  function atualizarQtde(produtoId: string, novaQuantidade: number) {
      // Garante que a quantidade não seja menor que 1 pelos botões (a action trata o 0 para remover)
      const quantidadeFinal = Math.max(1, novaQuantidade);
      carrinhoStore.atualizarQuantidade(produtoId, quantidadeFinal);
  }
  
  // Função para tratar a atualização pelo input numérico
  function atualizarQtdeInput(produtoId: string, event: Event) {
      const input = event.target as HTMLInputElement;
      const novaQuantidade = parseInt(input.value, 10) || 0; // Pega o valor, converte pra Int (ou 0 se falhar)
      carrinhoStore.atualizarQuantidade(produtoId, novaQuantidade); // Action trata se for <= 0
  }
  
  </script>
  
  <style scoped>
  /* Remove as setas do input[type=number] (opcional, para estética) */
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type='number'] {
    -moz-appearance: textfield; /* Firefox */
  }
  </style>