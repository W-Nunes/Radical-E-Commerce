<template>
  <div class="container mx-auto p-4 lg:p-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Finalizar Compra</h1>

    <div v-if="erroCheckout" class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-300">
       <strong>Erro:</strong> {{ erroCheckout }}
     </div>

    <div class="lg:grid lg:grid-cols-3 lg:gap-8">

      <div class="lg:col-span-2 mb-8 lg:mb-0">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Endereço de Entrega</h2>

        <form @submit.prevent="processarPedido" id="form-endereco" class="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div>
               <label for="cep" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
               <input
                 type="text"
                 id="cep"
                 v-model.trim="enderecoEntrega.cep"
                 required
                 placeholder="00000-000"
                 maxlength="9"
                 @input="formatarCep"
                 class="input-form"
                >
                </div>

             <div>
               <label for="rua" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rua / Logradouro</label>
               <input type="text" id="rua" v-model.trim="enderecoEntrega.rua" required class="input-form">
             </div>

             <div class="grid grid-cols-3 gap-4">
                 <div class="col-span-1">
                     <label for="numero" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
                     <input type="text" id="numero" v-model.trim="enderecoEntrega.numero" required class="input-form">
                 </div>
                 <div class="col-span-2">
                     <label for="complemento" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complemento <span class="text-xs text-gray-500">(Opcional)</span></label>
                     <input type="text" id="complemento" v-model.trim="enderecoEntrega.complemento" class="input-form">
                 </div>
             </div>

             <div>
               <label for="bairro" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
               <input type="text" id="bairro" v-model.trim="enderecoEntrega.bairro" required class="input-form">
             </div>

             <div class="grid grid-cols-3 gap-4">
                 <div class="col-span-2">
                     <label for="cidade" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
                     <input type="text" id="cidade" v-model.trim="enderecoEntrega.cidade" required class="input-form">
                 </div>
                 <div class="col-span-1">
                     <label for="estado" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado (UF)</label>
                     <input type="text" id="estado" v-model.trim="enderecoEntrega.estado" required maxlength="2" placeholder="SP" class="input-form uppercase">
                     </div>
             </div>

             </form>
        </div>

      <div class="lg:col-span-1">
        <div class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-6 h-fit sticky top-8">
           <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Resumo do Pedido</h2>
           <div v-if="isLoadingCarrinho" class="text-center py-4">
               <p class="text-gray-500 dark:text-gray-400 text-sm animate-pulse">Carregando itens...</p>
           </div>
           <div v-else-if="itensCarrinhoCheckout.length > 0" class="space-y-3 mb-4 border-b border-gray-300 dark:border-gray-600 pb-4">
               <div v-for="item in itensCarrinhoCheckout" :key="item.id" class="flex justify-between items-center text-sm">
                   <div class="flex items-center space-x-2">
                       <img :src="item.produto?.imagemUrlPrincipal || 'https://placehold.co/40x40/cccccc/E53E3E?text=X'" :alt="item.produto?.nome" class="w-8 h-8 rounded object-cover">
                       <span class="text-gray-700 dark:text-gray-300">
                           {{ item.produto?.nome || `Produto ID ${item.produtoId}` }} <span class="text-xs">x {{ item.quantidade }}</span>
                       </span>
                   </div>
                   <span class="font-medium text-gray-800 dark:text-gray-100">
                       R$ {{ formatarPreco((item.produto?.preco ?? item.precoUnitarioRegistrado) * item.quantidade) }}
                   </span>
               </div>
           </div>
           <div v-else class="text-center text-gray-500 dark:text-gray-400 py-4"> Carrinho vazio. </div>
           <div class="space-y-2 text-gray-700 dark:text-gray-300">
               <div class="flex justify-between"> <span>Subtotal:</span> <span class="font-medium">R$ {{ formatarPreco(valorTotalCarrinho) }}</span> </div>
               <div class="flex justify-between"> <span>Frete:</span> <span class="font-medium">Grátis</span> </div>
               <hr class="my-3 border-gray-300 dark:border-gray-600">
               <div class="flex justify-between text-lg font-bold text-gray-900 dark:text-white"> <span>Total:</span> <span>R$ {{ formatarPreco(valorTotalCarrinho) }}</span> </div>
           </div>

           <button
             type="submit"
             form="form-endereco" :disabled="isProcessing || itensCarrinhoCheckout.length === 0"
             class="mt-6 w-full bg-azul-radical hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 ease-in-out shadow disabled:opacity-50 disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
             {{ isProcessing ? 'Processando...' : 'Confirmar Endereço e Pagar' }}
           </button>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';
import { useCarrinhoStore } from '@/stores/carrinho.store';
import { usePedidosStore } from '@/stores/pedidos.store';
// --- Importar Tipos ---
import type { EnderecoInputType, CheckoutEnderecoInputType } from '@/types/endereco.input';
import type { ItemCarrinhoType } from '@/types/item-carrinho.output'; // Use seu tipo

const router = useRouter();
const authStore = useAuthStore();
const carrinhoStore = useCarrinhoStore();
const pedidosStore = usePedidosStore();

// Pegar estado reativo do carrinho
const {
  itensCarrinho: itensCarrinhoCheckout,
  valorTotal: valorTotalCarrinho,
  isLoading: isLoadingCarrinho 
} = storeToRefs(carrinhoStore);

// 3. PEGAR ESTADO REATIVO da pedidosStore
// Pega isCreatingOrder e createOrderError da store de pedidos
// Renomeia para isProcessing e erroCheckout para usar no template/lógica local
const { isCreatingOrder: isProcessing, createOrderError: erroCheckout } = storeToRefs(pedidosStore);

// Objeto Reativo para o Endereço
const enderecoEntrega = reactive<EnderecoInputType>({
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
});

onMounted(() => {
  if (!itensCarrinhoCheckout.value || itensCarrinhoCheckout.value.length === 0) {
    console.warn('[Checkout] Carrinho vazio, redirecionando para home.');
    alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
    router.push('/');
  }
});

function formatarPreco(valor: number | undefined | null): string {
  if (typeof valor !== 'number') return '0,00';
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatarCep(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 5) {
        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    enderecoEntrega.cep = value.slice(0, 9);
}

// Função processarPedido ATUALIZADA (sem simulação)
async function processarPedido() {

  console.log('[Checkout] Tentando processar pedido com endereço:', JSON.parse(JSON.stringify(enderecoEntrega)));
  // Monta o objeto de dados esperado pela mutation/action
  const dadosParaMutation: CheckoutEnderecoInputType = {
      entrega: { ...enderecoEntrega }

  };

  try {
    // CHAMADA REAL À ACTION DA STORE
    console.log('[Checkout] Chamando pedidosStore.criarPedido...');
    const pedidoCriado = await pedidosStore.criarPedido(dadosParaMutation); // USA A VARIÁVEL pedidosStore

    if (!pedidoCriado || !pedidoCriado.id) {
       console.error('[Checkout] A action criarPedido não retornou um pedido válido.');
       throw new Error("Falha ao obter os dados do pedido criado.");
    }
    // FIM DA CHAMADA REAL

    const pedidoIdReal = pedidoCriado.id; // Pega o ID REAL (UUID)
    console.log('[Checkout] Pedido criado com sucesso! ID:', pedidoIdReal);

    // Redirecionar para página de sucesso com o ID REAL
    router.push({ name: 'PedidoSucesso', params: { id: pedidoIdReal } });

  } catch (error: any) {
    // O erro já deve ter sido logado pela store e estará em erroCheckout (via storeToRefs)
    console.error('[Checkout] Erro capturado no componente ao chamar criarPedido:', error);
    // Opcional: scrollar para o topo para mostrar a mensagem de erro que está em erroCheckout.value
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

</script>

<style scoped>
.input-form {
    @apply mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-white;
}
</style>