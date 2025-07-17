import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gql } from '@apollo/client/core';
import apolloClient from '@/plugins/apollo';
import { useAuthStore } from './auth.store';
import type { CarrinhoType } from '@/types/carrinho.output'; 
import type { ItemCarrinhoType } from '@/types/item-carrinho.output'; 

// Fragmento GraphQL
const CarrinhoCompletoFragment = gql`
  fragment CarrinhoCompleto on Carrinho { # <-- Ajuste 'Carrinho' se necessário
    id
    total
    itens {
      id
      quantidade
      precoUnitarioRegistrado
      produtoId
      produto {
        id
        nome
        preco
        imagemUrlPrincipal # <-- Ajuste se necessário
        quantidadeEstoque
      }
    }
  }
`;

// Operações GraphQL

const MEU_CARRINHO_QUERY = gql`
  query MeuCarrinho {
    meuCarrinho { ...CarrinhoCompleto }
  }
  ${CarrinhoCompletoFragment}
`;

const ADICIONAR_ITEM_MUTATION = gql`
  mutation AdicionarItem($produtoId: ID!, $quantidade: Int!) {
    adicionarItemAoCarrinho(produtoId: $produtoId, quantidade: $quantidade) { ...CarrinhoCompleto }
  }
  ${CarrinhoCompletoFragment}
`;

const REMOVER_ITEM_MUTATION = gql`
  mutation RemoverItem($itemCarrinhoId: Int!) { # Verifique tipo Int ou ID
    removerItemDoCarrinho(itemCarrinhoId: $itemCarrinhoId) { ...CarrinhoCompleto }
  }
  ${CarrinhoCompletoFragment}
`;

const LIMPAR_CARRINHO_MUTATION = gql`
  mutation LimparCarrinho {
    limparCarrinho { ...CarrinhoCompleto }
  }
  ${CarrinhoCompletoFragment}
`;

// MUTATION: ATUALIZAR QUANTIDADE
const ATUALIZAR_QUANTIDADE_MUTATION = gql`
  mutation AtualizarQuantidade($itemCarrinhoId: Int!, $novaQuantidade: Int!) { # Verifique tipo ID (Int!)
    atualizarQuantidadeItemCarrinho(itemCarrinhoId: $itemCarrinhoId, novaQuantidade: $novaQuantidade) {
      ...CarrinhoCompleto
    }
  }
  ${CarrinhoCompletoFragment}
`;



// Store Pinia
export const useCarrinhoStore = defineStore('carrinho', () => {
  // State
  const carrinho = ref<CarrinhoType | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  // Getters
  const itensCarrinho = computed((): ItemCarrinhoType[] => carrinho.value?.itens ?? []);
  const totalItens = computed(() => itensCarrinho.value.reduce((total, item) => total + item.quantidade, 0));
  const valorTotal = computed(() => carrinho.value?.total ?? 0);
  const carrinhoId = computed(() => carrinho.value?.id);


  // ACTIONS

  async function buscarCarrinho() {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) {
      console.warn('[Carrinho Store] Usuário não autenticado. Limpando carrinho local.');
      carrinho.value = null; error.value = null; isLoading.value = false;
      return;
    }
    console.log('[Carrinho Store] Action buscarCarrinho...');
    isLoading.value = true; error.value = null;
    try {
      const { data, errors } = await apolloClient.query<{ meuCarrinho: CarrinhoType | null }>({
        query: MEU_CARRINHO_QUERY,
        fetchPolicy: 'network-only',
      });
      if (errors) throw errors[0] || new Error("Erro desconhecido do GraphQL ao buscar carrinho.");
      console.log('[Carrinho Store] Sucesso Query buscarCarrinho. Dados:', JSON.stringify(data?.meuCarrinho, null, 2));
      carrinho.value = data?.meuCarrinho ?? null;
    } catch (err: any) {
      console.error('[Carrinho Store] Erro CATCH ao buscar carrinho via apolloClient:', err);
      error.value = err;
      carrinho.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  async function adicionarItem(produtoId: string, quantidade: number) {
    console.log(`[Carrinho Store] Action adicionarItem ${produtoId} (Qtd: ${quantidade})`);
    try {
      const { data, errors } = await apolloClient.mutate<{ adicionarItemAoCarrinho: CarrinhoType }>({
        mutation: ADICIONAR_ITEM_MUTATION,
        variables: { produtoId, quantidade },
      });
      if (errors) throw errors[0] || new Error("Erro desconhecido do GraphQL ao adicionar item.");
      console.log('[Carrinho Store] Resultado mutation adicionarItem:', data);
      carrinho.value = data?.adicionarItemAoCarrinho ?? null;
    } catch (err: any) {
      console.error('[Carrinho Store] Erro ao executar mutation adicionarItem:', err);
      error.value = err;
      throw err;
    }
  }

   async function removerItem(itemCarrinhoId: number | string) {
     const idNumerico = Number(itemCarrinhoId);
     if (isNaN(idNumerico) || !Number.isInteger(idNumerico)) {
          const err = new Error(`ID do item inválido: ${itemCarrinhoId}`);
          error.value = err;
          throw err;
     }
     console.log(`[Carrinho Store] Action removerItem ID: ${idNumerico}`);
     try {
        const { data, errors } = await apolloClient.mutate<{ removerItemDoCarrinho: CarrinhoType | null }>({
            mutation: REMOVER_ITEM_MUTATION,
            variables: { itemCarrinhoId: idNumerico },
        });
        if (errors) throw errors[0] || new Error("Erro desconhecido do GraphQL ao remover item.");
        console.log('[Carrinho Store] Resultado mutation removerItem:', data);
        carrinho.value = data?.removerItemDoCarrinho ?? null;
     } catch (err: any) {
        console.error('[Carrinho Store] Erro ao executar mutation removerItem:', err);
        error.value = err;
        throw err;
     }
  }


  async function atualizarQuantidadeItem(itemCarrinhoId: number, novaQuantidade: number) {
      const idNum = Number(itemCarrinhoId);
      if (isNaN(idNum) || !Number.isInteger(idNum) || novaQuantidade < 1) {
          const err = new Error(`Dados inválidos para atualizar quantidade: ID=${itemCarrinhoId}, Qtd=${novaQuantidade}`);
          console.error('[Carrinho Store] ' + err.message);
          error.value = err;
          throw err;
      }

      console.log(`[Carrinho Store] Action atualizarQuantidadeItem ID: ${idNum}, Nova Qtd: ${novaQuantidade}`);
      try {
          const { data, errors } = await apolloClient.mutate<{ atualizarQuantidadeItemCarrinho: CarrinhoType | null }>({
              mutation: ATUALIZAR_QUANTIDADE_MUTATION, // Usa a mutation definida acima
              variables: { itemCarrinhoId: idNum, novaQuantidade },
          });

          if (errors) {
              console.error('[Carrinho Store] Erro GraphQL ao atualizar quantidade:', errors);
              throw errors[0] || new Error("Erro desconhecido do GraphQL ao atualizar quantidade.");
          }

          console.log('[Carrinho Store] Resultado mutation atualizarQuantidadeItem:', data);
          carrinho.value = data?.atualizarQuantidadeItemCarrinho ?? null;

      } catch (err: any) {
          console.error('[Carrinho Store] Erro CATCH ao executar mutation atualizarQuantidadeItem:', err);
          error.value = err;
          throw err;
      }
  }

  async function limparCarrinho() {
      console.log(`[Carrinho Store] Action limparCarrinho`);
      try {
        const { data, errors } = await apolloClient.mutate<{ limparCarrinho: CarrinhoType | null }>({
            mutation: LIMPAR_CARRINHO_MUTATION,
        });
        if (errors) throw errors[0] || new Error("Erro desconhecido do GraphQL ao limpar carrinho.");
        console.log('[Carrinho Store] Resultado mutation limparCarrinho:', data);
        carrinho.value = data?.limparCarrinho ?? null;
      } catch (err: any) {
        console.error('[Carrinho Store] Erro ao executar mutation limparCarrinho:', err);
        error.value = err;
        throw err;
      }
  }

  function limparCarrinhoLocal() {
      console.log('[Carrinho Store] Limpando estado local do carrinho.');
      carrinho.value = null;
      error.value = null;
      isLoading.value = false;
  }

  // EXPORTA
  return {
    // State
    carrinho,

    // Getters reativos
    itensCarrinho,
    totalItens,
    valorTotal,
    carrinhoId,

    // Estado reativo para UI
    isLoading,
    fetchError: error,

    // Actions
    buscarCarrinho,
    adicionarItem,
    removerItem,
    atualizarQuantidadeItem, 
    limparCarrinho,
    limparCarrinhoLocal,
  };

});