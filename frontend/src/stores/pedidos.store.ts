import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gql } from '@apollo/client/core';
import apolloClient from '@/plugins/apollo';
import { useCarrinhoStore } from './carrinho.store';

// Importar tipos necessários do frontend
import type { CheckoutEnderecoInputType } from '@/types/endereco.input';
import type { PedidoType } from '@/types/pedido.output';

// --- GraphQL Mutation ---
const CRIAR_PEDIDO_MUTATION = gql`
  mutation CriarPedidoMutation($endereco: EnderecoInput!) {
    criarPedido(endereco: $endereco) {
      id
      status
      valorTotal
      criadoEm
    }
  }
`;

export const usePedidosStore = defineStore('pedidos', () => {
  // --- STATE ---
  const pedidoAtual = ref<PedidoType | null>(null);
  const isCreatingOrder = ref<boolean>(false);
  const createOrderError = ref<Error | null>(null);

  // --- ACTIONS ---
  async function criarPedido(enderecoData: CheckoutEnderecoInputType): Promise<PedidoType> {
    console.log('[Pedidos Store] Action criarPedido iniciada com dados:', enderecoData);
    isCreatingOrder.value = true;
    createOrderError.value = null;
    const carrinhoStore = useCarrinhoStore();

    try {
      // ✅ INÍCIO DA CORREÇÃO ✅
      
      const { entrega } = enderecoData;

      // 1. Validação simples para evitar chamadas desnecessárias
      if (!entrega.cep || !entrega.rua || !entrega.numero || !entrega.bairro || !entrega.cidade || !entrega.estado) {
        throw new Error("Todos os campos de endereço são obrigatórios.");
      }

      // 2. Limpeza e estruturação dos dados para corresponder ao DTO do backend
      const variables = {
        endereco: { // Objeto principal que a mutation espera
          entrega: { // Objeto aninhado `entrega`
            rua: entrega.rua,
            numero: entrega.numero,
            complemento: entrega.complemento || null, // Garante `null` se for vazio
            bairro: entrega.bairro,
            cidade: entrega.cidade,
            estado: entrega.estado.toUpperCase(), // Garante UF em maiúsculas
            cep: entrega.cep.replace(/\D/g, ''), // Remove qualquer coisa que não seja dígito
          },
          // Se houvesse um endereço de faturamento, ele iria aqui
          faturamento: null,
        }
      };
      
      console.log('[Pedidos Store] Variáveis SANITIZADAS enviadas para mutation:', JSON.stringify(variables, null, 2));
      
      // ✅ FIM DA CORREÇÃO ✅

      const { data, errors } = await apolloClient.mutate<{ criarPedido: PedidoType }>({
        mutation: CRIAR_PEDIDO_MUTATION,
        variables: variables,
        fetchPolicy: 'no-cache'
      });

      if (errors) {
        console.error('[Pedidos Store] Erro GraphQL ao criar pedido:', errors);
        throw errors[0] || new Error('Erro desconhecido do GraphQL ao criar pedido.');
      }

      if (!data?.criarPedido) {
        console.error('[Pedidos Store] Resposta da mutation criarPedido vazia ou inválida.');
        throw new Error('Falha ao processar a resposta da criação do pedido.');
      }

      console.log('[Pedidos Store] Pedido criado com sucesso:', data.criarPedido);
      pedidoAtual.value = data.criarPedido;

      console.log('[Pedidos Store] Limpando carrinho após criação do pedido...');
      carrinhoStore.limparCarrinhoLocal();

      return data.criarPedido;

    } catch (err: any) {
      console.error('[Pedidos Store] Erro CATCH ao criar pedido:', err);
      createOrderError.value = err;
      throw err;
    } finally {
      isCreatingOrder.value = false;
    }
  }

  // --- EXPORTAR ---
  return {
    // State
    pedidoAtual,
    isCreatingOrder,
    createOrderError,
    // Actions
    criarPedido,
  };
});