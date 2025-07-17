import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { gql } from '@apollo/client/core';
import apolloClient from '@/plugins/apollo';
import type { FreteOutput } from '@/types/frete.output'; 

export const useFreteStore = defineStore('frete', () => {
  
  // --- STATE ---
  const cep = ref<string>('');
  const opcoes = ref<FreteOutput[]>([]);
  const selecionado = ref<FreteOutput | null>(null);
  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  // --- GETTERS ---
  const cepFormatado = computed(() => cep.value);
  const valorFreteSelecionado = computed(() => selecionado.value?.valor ?? 0);
  const servicoSelecionado = computed(() => selecionado.value);

  // --- ACTIONS ---

  // Limpa os dados do frete
  function limparFrete() {
    cep.value = '';
    opcoes.value = [];
    selecionado.value = null;
    error.value = null;
    isLoading.value = false;
  }

  // Define a opção de frete escolhida pelo usuário
  function selecionarOpcao(opcao: FreteOutput) {
    selecionado.value = opcao;
  }

  // Consulta a nossa API GraphQL
  async function calcularFrete(cepDestino: string) {
    if (!cepDestino || cepDestino.length < 8) {
      error.value = new Error('CEP inválido.');
      return;
    }

    isLoading.value = true;
    error.value = null;
    opcoes.value = [];
    selecionado.value = null;
    cep.value = cepDestino;

    const CALCULAR_FRETE_QUERY = gql`
      query CalcularFrete($cep: String!) {
        calcularFrete(cep: $cep) {
          servico
          valor
          prazoEntrega
        }
      }
    `;

    try {
      const { data, errors } = await apolloClient.query<{ calcularFrete: FreteOutput[] }>({
        query: CALCULAR_FRETE_QUERY,
        variables: { cep: cepDestino },
        fetchPolicy: 'network-only',
      });

      if (errors) throw errors[0];

      opcoes.value = data.calcularFrete;
      // Seleciona o frete mais barato por padrão
      if (data.calcularFrete.length > 0) {
        selecionado.value = data.calcularFrete.reduce((prev, curr) => (prev.valor < curr.valor ? prev : curr));
      }

    } catch (err: any) {
      error.value = err;
      opcoes.value = [];
    } finally {
      isLoading.value = false;
    }
  }

  return {
    // State
    cep,
    opcoes,
    selecionado,
    isLoading,
    error,
    // Getters
    cepFormatado,
    valorFreteSelecionado,
    servicoSelecionado,
    // Actions
    calcularFrete,
    selecionarOpcao,
    limparFrete,
  };
});