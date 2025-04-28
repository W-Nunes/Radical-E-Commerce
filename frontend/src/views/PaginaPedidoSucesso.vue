<template>
    <div class="container mx-auto p-4 lg:p-8">
      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-500 dark:text-gray-400 text-lg animate-pulse">Carregando detalhes do pedido...</p>
      </div>
  
      <div v-else-if="error" class="text-center py-10 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 shadow-sm">
        <strong class="font-bold text-red-700 dark:text-red-300">Erro ao buscar pedido!</strong>
        <span class="block sm:inline text-red-600 dark:text-red-400 mt-1">{{ error.message }}</span>
        </div>
  
      <div v-else-if="pedido" class="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-10">
        <div class="text-center border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Pedido Realizado com Sucesso!</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">Obrigado pela sua compra, {{ pedido.usuario?.nome || 'Cliente' }}!</p>
        </div>
  
        <div class="space-y-6">
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Número do Pedido:</span>
            <span class="font-mono text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{{ pedido.id }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Status do Pedido:</span>
            <span :class="statusClass(pedido.status)" class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
              {{ formatarStatus(pedido.status) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Data do Pedido:</span>
            <span class="text-gray-800 dark:text-gray-200">{{ formatarData(pedido.criadoEm) }}</span>
          </div>
           <div class="flex justify-between items-center">
            <span class="text-gray-600 dark:text-gray-400 font-medium">Valor Total:</span>
            <span class="text-lg font-bold text-gray-900 dark:text-white">R$ {{ formatarPreco(pedido.valorTotal) }}</span>
          </div>
  
          <div>
            <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-4">Itens Comprados</h3>
            <ul class="space-y-3">
              <li v-for="item in pedido.itens" :key="item.id" class="flex items-center justify-between text-sm">
                 <span class="text-gray-700 dark:text-gray-300">
                   {{ item.nomeProduto || `Produto ID ${item.produtoId}` }} <span class="text-xs text-gray-500">x {{ item.quantidade }}</span>
                 </span>
                 <span class="font-medium text-gray-600 dark:text-gray-400">
                   R$ {{ formatarPreco(item.precoUnitarioCompra * item.quantidade) }}
                 </span>
              </li>
            </ul>
          </div>
  
          <div>
             <h3 class="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100 border-t border-gray-200 dark:border-gray-700 pt-4">Endereço de Entrega</h3>
             <div class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                 <p>{{ pedido.enderecoEntrega.rua }}, {{ pedido.enderecoEntrega.numero }} {{ pedido.enderecoEntrega.complemento ? `- ${pedido.enderecoEntrega.complemento}` : '' }}</p>
                 <p>{{ pedido.enderecoEntrega.bairro }}</p>
                 <p>{{ pedido.enderecoEntrega.cidade }} - {{ pedido.enderecoEntrega.estado }}</p>
                 <p>CEP: {{ pedido.enderecoEntrega.cep }}</p>
             </div>
          </div>
  
        </div>
  
         <div class="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center space-x-4">
             <router-link to="/meus-pedidos" class="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-5 rounded-md transition duration-150 ease-in-out">
                 Ver Meus Pedidos
             </router-link>
              <router-link to="/" class="inline-block bg-azul-radical hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-md transition duration-150 ease-in-out shadow">
                 Voltar à Loja
             </router-link>
         </div>
  
      </div>
  
       <div v-else class="text-center py-16">
           <p class="text-xl text-gray-600 dark:text-gray-400">Pedido não encontrado.</p>
       </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { gql } from '@apollo/client/core';
  import { useQuery } from '@vue/apollo-composable';
  import type { PedidoOutput } from '@/types/pedido.output'; // <<< VERIFIQUE/CRIE ESTE TIPO
  import type { OrderStatus } from '@/types/order-status.enum'; // <<< VERIFIQUE/CRIE ESTE ENUM
  
  // --- Query para buscar detalhes do pedido ---
  // Ajuste os campos conforme o PedidoOutput do backend
  const PEDIDO_POR_ID_QUERY = gql`
    query PedidoPorIdQuery($id: ID!) {
      pedidoPorId(id: $id) {
        id
        valorTotal
        status
        criadoEm
        enderecoEntrega { # Certifique-se que o tipo EnderecoOutput existe no frontend
          rua
          numero
          complemento
          bairro
          cidade
          estado
          cep
        }
        usuario { # Pede dados do usuário
          id
          nome
          # email # Opcional
        }
        itens { # Pede detalhes dos itens
          id
          produtoId
          nomeProduto
          quantidade
          precoUnitarioCompra
        }
      }
    }
  `;
  
  const route = useRoute();
  const pedidoId = computed(() => route.params.id as string); // Pega o ID da URL
  
  // --- Executar a Query ---
  const { result, loading, error } = useQuery<{ pedidoPorId: PedidoOutput | null }>(
    PEDIDO_POR_ID_QUERY,
    // Passa o ID como variável para a query
    () => ({ id: pedidoId.value }),
    // Opções
    () => ({
      // Só executa a query se pedidoId tiver um valor
      enabled: !!pedidoId.value,
      // Busca na rede primeiro, depois cache
      fetchPolicy: 'cache-and-network',
      // Considerar 'no-cache' se quiser sempre buscar do servidor
      // fetchPolicy: 'no-cache',
    })
  );
  
  // --- Dados do Pedido ---
  // Usa computed para extrair o pedido do resultado da query
  const pedido = computed(() => result.value?.pedidoPorId);
  
  // --- Funções Auxiliares ---
  function formatarPreco(valor: number | undefined | null): string {
    if (typeof valor !== 'number') return '0,00';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  
  function formatarData(data: string | Date | undefined | null): string {
    if (!data) return '-';
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        // hour: '2-digit', minute: '2-digit' // Opcional: adicionar hora
      });
    } catch (e) {
      return '-';
    }
  }
  
  // Mapeia o status Enum para texto legível
  function formatarStatus(status: OrderStatus | undefined | null): string {
    if (!status) return 'Desconhecido';
    // Crie um mapeamento ou use um switch case
    const mapaStatus: Record<OrderStatus, string> = {
      PENDENTE: 'Pendente',
      PAGO: 'Pagamento Aprovado',
      PROCESSANDO: 'Em Processamento',
      ENVIADO: 'Enviado',
      ENTREGUE: 'Entregue',
      CANCELADO: 'Cancelado',
      FALHOU: 'Pagamento Falhou',
    };
    return mapaStatus[status] || status; // Retorna o mapeado ou o valor original
  }
  
  // Define classes CSS baseadas no status para destaque visual
  function statusClass(status: OrderStatus | undefined | null): string {
    switch (status) {
      case 'PAGO':
      case 'ENTREGUE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'ENVIADO':
      case 'PROCESSANDO':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'CANCELADO':
      case 'FALHOU':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  }
  
  // Opcional: Observar erro para log ou notificação
  watch(error, (newError) => {
      if (newError) {
          console.error("[PedidoSucesso] Erro ao buscar pedido:", newError);
          // Poderia mostrar um toast de erro aqui
      }
  });
  
  </script>
  
  <style scoped>
  /* Estilos específicos se necessário */
  </style>