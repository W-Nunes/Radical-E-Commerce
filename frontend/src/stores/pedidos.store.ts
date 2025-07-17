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
  mutation CriarPedidoMutation($endereco: EnderecoInput!) { # Nome da variável e tipo do backend!
    criarPedido(endereco: $endereco) {
      # Pedir os campos que você quer receber de volta após criar
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
  const isCreatingOrder = ref<boolean>(false); // Estado de loading
  const createOrderError = ref<Error | null>(null); // Estado de erro

  // --- ACTIONS ---
  async function criarPedido(enderecoData: CheckoutEnderecoInputType): Promise<PedidoType> {
    console.log('[Pedidos Store] Action criarPedido iniciada com dados:', enderecoData);
    isCreatingOrder.value = true; // Ativa loading
    createOrderError.value = null; // Limpa erro anterior
    const carrinhoStore = useCarrinhoStore();

    try {
      // Confere a estrutura esperada pela variável $endereco na mutation
      const variables = {
          endereco: enderecoData // Se 'enderecoData' já tem { entrega, faturamento? }
          // Ou: endereco: { entrega: enderecoData } // Se 'enderecoData' for só o EnderecoInputType
      };
      console.log('[Pedidos Store] Variáveis enviadas para mutation:', variables);


      const { data, errors } = await apolloClient.mutate<{ criarPedido: PedidoType }>({
        mutation: CRIAR_PEDIDO_MUTATION,
        variables: variables,
        // Evitar cache na mutation de criação para garantir dados novos
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
      // Chama a action que limpa o estado LOCAL da store do carrinho
      // para a UI refletir imediatamente, ou buscar do backend se preferir.
      carrinhoStore.limparCarrinhoLocal();

      return data.criarPedido;

    } catch (err: any) {
      console.error('[Pedidos Store] Erro CATCH ao criar pedido:', err);
      createOrderError.value = err; // Armazena o erro no estado
      throw err; // Re-lança para o componente
    } finally {
      isCreatingOrder.value = false; // Desativa loading
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