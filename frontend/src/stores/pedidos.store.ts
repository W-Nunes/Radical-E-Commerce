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
      const { entrega } = enderecoData;

      // 1. Validação simples para evitar chamadas desnecessárias
      if (!entrega.cep || !entrega.rua || !entrega.numero || !entrega.bairro || !entrega.cidade || !entrega.estado) {
        throw new Error("Todos os campos de endereço são obrigatórios.");
      }

      // 2. Limpeza, formatação e garantia dos tipos de dados
      const variables = {
        endereco: {
          entrega: {
            rua: String(entrega.rua),
            // ✅ AJUSTE FINAL: Garante que o número seja sempre uma string
            numero: String(entrega.numero), 
            complemento: entrega.complemento || null,
            bairro: String(entrega.bairro),
            cidade: String(entrega.cidade),
            estado: String(entrega.estado).toUpperCase(),
            cep: String(entrega.cep).replace(/\D/g, ''),
          },
          faturamento: null,
        }
      };
      
      console.log('[Pedidos Store] Variáveis FINAIS enviadas para mutation:', JSON.stringify(variables, null, 2));

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