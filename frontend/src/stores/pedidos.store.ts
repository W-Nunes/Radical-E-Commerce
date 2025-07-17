import { defineStore } from 'pinia';
import { ref } from 'vue';
import { gql } from '@apollo/client/core';
import apolloClient from '@/plugins/apollo';
import { useCarrinhoStore } from './carrinho.store';
import type { CheckoutEnderecoInputType } from '@/types/endereco.input';
import type { PedidoType } from '@/types/pedido.output';

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
  const pedidoAtual = ref<PedidoType | null>(null);
  const isCreatingOrder = ref<boolean>(false);
  const createOrderError = ref<Error | null>(null);

  async function criarPedido(enderecoData: CheckoutEnderecoInputType): Promise<PedidoType> {
    isCreatingOrder.value = true;
    createOrderError.value = null;
    const carrinhoStore = useCarrinhoStore();

    try {
      const { entrega } = enderecoData;
      
      if (!entrega.cep || !entrega.rua || !entrega.numero || !entrega.bairro || !entrega.cidade || !entrega.estado) {
        throw new Error("Todos os campos de endereço são obrigatórios.");
      }

      const variables = {
        endereco: {
          entrega: {
            rua: String(entrega.rua),
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

      const { data, errors } = await apolloClient.mutate<{ criarPedido: PedidoType }>({
        mutation: CRIAR_PEDIDO_MUTATION,
        variables: variables,
        fetchPolicy: 'no-cache'
      });

      if (errors) {
        throw errors[0];
      }

      if (!data?.criarPedido) {
        throw new Error('Falha ao processar a resposta da criação do pedido.');
      }

      pedidoAtual.value = data.criarPedido;
      carrinhoStore.limparCarrinhoLocal();
      return data.criarPedido;

    } catch (err: any) {
      const validationErrors = err.graphQLErrors?.[0]?.extensions?.response?.message;
      if (validationErrors && Array.isArray(validationErrors)) {
        const firstError = validationErrors[0];
        const userFriendlyError = new Error(`Erro de validação: ${firstError}`);
        createOrderError.value = userFriendlyError;
        throw userFriendlyError;
      } else {
         createOrderError.value = err;
         throw err;
      }
    } finally {
      isCreatingOrder.value = false;
    }
  }

  return {
    pedidoAtual,
    isCreatingOrder,
    createOrderError,
    criarPedido,
  };
});