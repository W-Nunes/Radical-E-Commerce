<template>
  <div class="container mx-auto p-4 lg:p-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Meu Carrinho</h1>

    <div v-if="isLoading" class="text-center py-20">
      <p class="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Carregando carrinho...</p>
    </div>

    <div v-else-if="fetchError" class="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-sm">
      <strong class="font-bold text-red-700 dark:text-red-300">Erro ao buscar carrinho!</strong>
      <span class="block sm:inline text-red-600 dark:text-red-400 mt-1">{{ fetchError.message }}</span>
      <button @click="carrinhoStore.buscarCarrinho()" class="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">Tentar Novamente</button>
    </div>

     <div v-else-if="!itensCarrinho || itensCarrinho.length === 0" class="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
       <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1"> <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> </svg>
       <p class="text-xl mt-4 font-semibold text-gray-600 dark:text-gray-300">Seu carrinho está vazio.</p>
       <p class="text-gray-500 dark:text-gray-400 mt-1">Que tal adicionar uns produtos radicais?</p>
       <router-link to="/" class="mt-6 inline-block bg-azul-radical hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md transition duration-150 ease-in-out shadow">
         Continuar Comprando
       </router-link>
    </div>

    <div v-else class="lg:grid lg:grid-cols-3 lg:gap-8">

      <div class="lg:col-span-2 space-y-4 mb-8 lg:mb-0">
        <div v-if="erroGeral" class="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-700 dark:text-red-300">
          <strong>Erro:</strong> {{ erroGeral }}
        </div>
        <div
          v-for="item in itensCarrinho"
          :key="item.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col sm:flex-row items-center space-x-0 sm:space-x-4 space-y-3 sm:space-y-0 relative transition-opacity duration-150 ease-in-out"
           :class="{ 'opacity-50 pointer-events-none': atualizandoItemId === item.id || removendoItemId === item.id }"
          >

          <img
            :src="item.produto?.imagemUrlPrincipal || 'https://placehold.co/100x100/cccccc/E53E3E?text=Radical'"
            :alt="item.produto?.nome || 'Produto sem nome'"
            class="w-24 h-24 object-cover rounded-md border border-gray-200 dark:border-gray-700 flex-shrink-0"
          >
          <div class="flex-grow text-center sm:text-left">
            <h3 class="font-semibold text-lg text-gray-900 dark:text-white">{{ item.produto?.nome || `Produto ID: ${item.produtoId}` }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              R$ {{ formatarPreco(item.produto?.preco ?? item.precoUnitarioRegistrado) }} / un.
            </p>
            <div class="flex items-center justify-center sm:justify-start my-2 space-x-2">
               <button
                 @click="atualizarQuantidade(item, item.quantidade - 1)"
                 :disabled="atualizandoItemId === item.id || item.quantidade <= 1"
                 class="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 transition duration-150"
                >
                 -
               </button>
               <span class="px-3 text-gray-800 dark:text-gray-200 w-8 text-center">{{ item.quantidade }}</span>
               <button
                 @click="atualizarQuantidade(item, item.quantidade + 1)"
                 :disabled="atualizandoItemId === item.id"
                  class="px-2 py-1 border rounded disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 hover:bg-gray-100 transition duration-150"
                 >
                 +
               </button>
               <svg v-if="atualizandoItemId === item.id" class="animate-spin h-4 w-4 text-azul-radical ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                   <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
             </div>

          <div class="w-full sm:w-24 text-center sm:text-right font-medium text-gray-800 dark:text-gray-100">
            R$ {{ formatarPreco((item.produto?.preco ?? item.precoUnitarioRegistrado) * item.quantidade) }}
          </div>

          <button
            @click="confirmarRemoverItem(item.id, item.produto?.nome)"
            :disabled="removendoItemId === item.id || atualizandoItemId === item.id" class="absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            title="Remover item"
           >
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
             </svg>
          </button>
        </div>

        <button
          @click="limparCarrinhoCompleto()"
          :disabled="!itensCarrinho || itensCarrinho.length === 0 || isLoading"
          class="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
         >
          Limpar Carrinho
        </button>
      </div>

      <div class="lg:col-span-1 bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-6 h-fit sticky top-8">
         <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Resumo do Pedido</h2>
         <div class="space-y-2 text-gray-700 dark:text-gray-300">
           <div class="flex justify-between">
             <span>Subtotal ({{ totalItens }} itens):</span>
             <span class="font-medium">R$ {{ formatarPreco(valorTotal) }}</span>
           </div>

           <div class="pt-4 border-t border-gray-200 dark:border-gray-600">
            <label for="cep" class="block text-sm font-bold text-gray-700 dark:text-gray-300">Calcular Frete</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <input v-model="cepInput" @keyup.enter="handleCalcularFrete" type="text" id="cep" placeholder="00000-000" class="input-form flex-grow !rounded-r-none appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              <button @click="handleCalcularFrete" :disabled="freteStore.isLoading" class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50">
                <span>{{ freteStore.isLoading ? '...' : 'OK' }}</span>
              </button>
            </div>

            <div v-if="freteStore.error" class="text-red-500 text-xs mt-1">{{ freteStore.error.message }}</div>

            <div v-if="freteStore.opcoes.length > 0" class="mt-4 space-y-2">
              <div v-for="opcao in freteStore.opcoes" :key="opcao.servico" @click="freteStore.selecionarOpcao(opcao)"
                class="p-3 border rounded-md cursor-pointer transition-colors"
                :class="freteStore.selecionado?.servico === opcao.servico ? 'bg-blue-100 border-azul-radical dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-sm">{{ opcao.servico }}</span>
                  <span class="font-bold text-sm">R$ {{ formatarPreco(opcao.valor) }}</span>
                </div>
                <p class="text-xs text-gray-500">Prazo: {{ opcao.prazoEntrega }} dias</p>
              </div>
            </div>
          </div>
          <hr class="my-3 border-gray-300 dark:border-gray-600">
           <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
             <span>Total:</span>
             <span>R$ {{ formatarPreco(totalComFrete) }}</span>
           </div>
         </div>
         <button
           @click="irParaCheckout"
           :disabled="!freteStore.selecionado || !itensCarrinho || itensCarrinho.length === 0 || isLoading"
           class="mt-6 w-full bg-azul-radical hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out shadow disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
           >
           {{ isLoading ? 'Aguarde...' : 'Ir para Checkout' }}
         </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';
import { useFreteStore } from '@/stores/frete.store';
import type { ItemCarrinhoType } from '@/types/item-carrinho.output';

const carrinhoStore = useCarrinhoStore();
const authStore = useAuthStore();
const router = useRouter();
const freteStore = useFreteStore();

const { itensCarrinho, valorTotal, totalItens, isLoading, fetchError } = storeToRefs(carrinhoStore);

const removendoItemId = ref<number | null>(null);
const atualizandoItemId = ref<number | null>(null);
const erroGeral = ref<string | null>(null);
const cepInput = ref('');

const totalComFrete = computed(() => {
  return valorTotal.value + freteStore.valorFreteSelecionado;
});

onMounted(() => {
  console.log('[PaginaCarrinho] onMounted - Iniciando.');
  console.log('[PaginaCarrinho] onMounted - Autenticado:', authStore.isAuthenticated);
  if (!carrinhoStore.carrinho && !isLoading.value && authStore.isAuthenticated) {
    console.log('[PaginaCarrinho] Montado. Buscando carrinho...');
    carrinhoStore.buscarCarrinho();
  }
});

function handleCalcularFrete() {
  freteStore.calcularFrete(cepInput.value);
}

function formatarPreco(valor: number | undefined | null): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function atualizarQuantidade(item: ItemCarrinhoType, novaQuantidade: number) {
  if (novaQuantidade < 1) {
      console.warn('[CarrinhoView] Tentativa de reduzir quantidade abaixo de 1 ignorada.');
      return;
  }

  atualizandoItemId.value = item.id;
  erroGeral.value = null;
  console.log(`[CarrinhoView] Tentando atualizar item ID: ${item.id} para quantidade: ${novaQuantidade}`);

  try {
    await carrinhoStore.atualizarQuantidadeItem(item.id, novaQuantidade);
    console.log(`[CarrinhoView] Quantidade do item ${item.id} atualizada com sucesso (via store).`);
  } catch (error: any) {
    console.error('[CarrinhoView] Erro ao atualizar quantidade:', error);
    erroGeral.value = error.message || 'Falha ao atualizar a quantidade do item.';
  } finally {
    atualizandoItemId.value = null;
  }
}

async function confirmarRemoverItem(itemId: number, nomeProduto?: string | null) {
  const nome = nomeProduto || 'este item';
  if (confirm(`Tem certeza que deseja remover "${nome}" do carrinho?`)) {
    removendoItemId.value = itemId;
    erroGeral.value = null;
    console.log(`[CarrinhoView] Tentando remover item ID: ${itemId}`);
    try {
      await carrinhoStore.removerItem(itemId);
      console.log(`[CarrinhoView] Item ${itemId} removido com sucesso (via store).`);
    } catch (error: any) {
      console.error('[CarrinhoView] Erro ao remover item:', error);
      erroGeral.value = error.message || 'Falha ao remover item do carrinho.';
    } finally {
      removendoItemId.value = null;
    }
  }
}

async function limparCarrinhoCompleto() {
  if (confirm('Tem certeza que deseja remover todos os itens do carrinho?')) {
     erroGeral.value = null;
     console.log(`[CarrinhoView] Tentando limpar carrinho completo...`);
     try {
         await carrinhoStore.limparCarrinho();
         console.log(`[CarrinhoView] Carrinho limpo com sucesso (via store).`);
     } catch(error: any) {
         console.error('[CarrinhoView] Erro ao limpar carrinho:', error);
         erroGeral.value = error.message || 'Falha ao limpar o carrinho.';
     }
  }
}

function irParaCheckout() {
  if (!authStore.isAuthenticated) {
    alert('Você precisa estar logado para finalizar a compra.');
    router.push({ name: 'Login' });
    return;
  }
  if (!itensCarrinho.value || itensCarrinho.value.length === 0) {
     alert('Seu carrinho está vazio!');
     return;
  }
  if (!freteStore.selecionado) {
    alert('Por favor, calcule e selecione uma opção de frete.');
    return;
  }
  console.log('Navegando para a página de checkout (endereço)...');
  router.push({ name: 'CheckoutEndereco' });
}

</script>

<style scoped>
/* ... (estilos mantidos) ... */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield; /* Firefox */
}

/* Adicionando classe para reutilizar no input de CEP */
.input-form {
    @apply appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white;
}
</style>