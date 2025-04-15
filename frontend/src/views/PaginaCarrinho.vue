<template>
  <div class="container mx-auto p-4 lg:p-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Meu Carrinho</h1>

    <div v-if="carrinhoStore.listaItens.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
       <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"> <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>
      <p class="text-xl mt-4 font-semibold text-gray-600 dark:text-gray-300">Seu carrinho está vazio.</p>
      <p class="text-gray-500 dark:text-gray-400 mt-1">Que tal adicionar uns produtos radicais?</p>
      <router-link to="/" class="mt-6 inline-block bg-azul-radical text-white font-bold py-2 px-6 rounded hover:bg-opacity-80 transition-colors duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical">
        Continuar Comprando
      </router-link>
    </div>

    <div v-else class="lg:grid lg:grid-cols-3 lg:gap-8">

      <div class="lg:col-span-2 space-y-4 mb-8 lg:mb-0">
        <div
          v-for="item in carrinhoStore.listaItens"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <img :src="item.imagemUrlPrincipal || 'https://placehold.co/100x100/cccccc/E53E3E?text=Radical'"
                 :alt="item.nome"
                 class="w-24 h-24 object-cover rounded flex-shrink-0 border dark:border-gray-700">

            <div class="flex-grow">
              <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ item.nome }}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">R$ {{ formatarPreco(item.preco) }} / un.</p>
            </div>

            <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded self-start sm:self-center">
               <button @click="atualizarQtde(item.id, item.quantidade - 1)" :disabled="item.quantidade <= 1" class="px-3 h-8 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-l transition-colors">-</button>
               <input
                 type="number"
                 :value="item.quantidade"
                 @change="atualizarQtdeInput(item.id, $event)" min="1"
                 class="w-10 h-8 text-center border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none text-gray-900 dark:text-white text-sm appearance-none"
               >
               <button @click="atualizarQtde(item.id, item.quantidade + 1)" class="px-3 h-8 font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 rounded-r transition-colors">+</button>
            </div>

            <div class="w-24 text-right font-medium text-gray-800 dark:text-gray-200 self-center">
              R$ {{ formatarPreco(item.preco * item.quantidade) }}
            </div>

            <button @click="carrinhoStore.removerItem(item.id)" class="p-1 text-gray-400 hover:text-vermelho-radical dark:hover:text-vermelho-radical rounded-full hover:bg-red-100 dark:hover:bg-gray-700 transition-colors self-center ml-2" title="Remover Item">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /> </svg>
               <span class="sr-only">Remover</span>
            </button>
        </div>
         <button @click="carrinhoStore.limparCarrinho()" class="mt-4 text-sm text-gray-500 hover:text-vermelho-radical hover:underline dark:text-gray-400 dark:hover:text-vermelho-radical">
            Limpar Carrinho
         </button>
      </div>

      <div class="lg:col-span-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 lg:sticky lg:top-24 self-start">
          <h2 class="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-700 pb-2 text-gray-800 dark:text-white">Resumo do Pedido</h2>
          <div class="space-y-3">
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({{ carrinhoStore.totalItens }} itens)</span>
                  <span>R$ {{ formatarPreco(carrinhoStore.valorTotal) }}</span>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Frete</span>
                  <span class="text-green-600 dark:text-green-400">Grátis</span> </div>
              <div class="border-t border-gray-300 dark:border-gray-700 pt-3 mt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>R$ {{ formatarPreco(carrinhoStore.valorTotal) }}</span> </div>
          </div>

          <button
            :disabled="carrinhoStore.totalItens === 0"
            class="mt-6 w-full bg-azul-radical hover:bg-opacity-80 text-white font-bold py-3 px-6 rounded text-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-azul-radical disabled:opacity-50 disabled:cursor-not-allowed"
            @click="irParaCheckout"
            >
            Ir para Checkout (WIP)
          </button>

      </div>

    </div> </div> </template>

<script setup lang="ts">
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useRouter } from 'vue-router'; // Importar router para o botão de checkout

const carrinhoStore = useCarrinhoStore();
const router = useRouter(); // Instanciar router

function formatarPreco(valor: number): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function atualizarQtde(produtoId: string, novaQuantidade: number) {
   // A action do store já trata quantidade <= 0 para remover
   carrinhoStore.atualizarQuantidade(produtoId, novaQuantidade);
}

function atualizarQtdeInput(produtoId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    let novaQuantidade = parseInt(input.value, 10);
    // Evita NaN e garante que seja pelo menos 0 (action trata o remover)
    if (isNaN(novaQuantidade)) {
        novaQuantidade = 0; // Ou talvez buscar a quantidade anterior do item? Melhor 0.
        input.value = '0'; // Reseta visualmente se digitar algo inválido
    }
    // Opcional: Limitar pelo estoque máximo aqui também
    // const item = carrinhoStore.items.find(i => i.id === produtoId);
    // if(item && novaQuantidade > item.algumCampoDeEstoqueMaximo?) { ... }
    carrinhoStore.atualizarQuantidade(produtoId, novaQuantidade);
}

// Placeholder para navegação do checkout
function irParaCheckout() {
    alert('Navegação para Checkout ainda não implementada!');
    // router.push('/checkout'); // Descomentar quando a rota existir
}

</script>

<style scoped>
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}
</style>