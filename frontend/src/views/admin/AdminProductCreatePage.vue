<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Criar Novo Produto</h2>
  
      <div v-if="creationError" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Erro!</strong>
        <span class="block sm:inline"> {{ creationError }}</span>
      </div>
  
      <AdminProductForm
        :is-submitting="loading"
        @submit="handleCreateProduct"
      />
      </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useMutation } from '@vue/apollo-composable';
  import gql from 'graphql-tag';
  import type { ProdutoFormData } from '@/components/admin/AdminProductForm.vue';
  
  // Importa o componente do formulário
  import AdminProductForm from '@/components/admin/AdminProductForm.vue';
  // Importa os tipos necessários (ajuste o caminho se necessário)
  import type { ProdutoOutput } from '@/types/produto.output'; 

  // Estado
  const creationError = ref<string | null>(null); // Mensagem de erro desta página
  const router = useRouter();                   // Para redirecionamento
  
  // GraphQL Mutation 
  const CRIAR_PRODUTO_MUTATION = gql`
    mutation CriarProdutoAdmin($dados: CriarProdutoInput!) {
      criarProduto(dados: $dados) {
        id
        nome
        sku
      }
    }
  `;
  
  // Configuração useMutation
  const {
    mutate: executarCriarProduto,
    loading, // Usaremos para desabilitar o botão no formulário filho
    onError,
    onDone,
  } = useMutation<{ criarProduto: ProdutoOutput }>(
      CRIAR_PRODUTO_MUTATION,

  );
  
  // Handler para o evento @submit do formulário
  const handleCreateProduct = (formData: ProdutoFormData) => {
    creationError.value = null;
    console.log('[AdminCreatePage] Recebido submit do form:', formData);
  
    // Chama a mutation GraphQL com os dados recebidos
    executarCriarProduto({
      dados: { // Garante que o objeto passado corresponde ao CriarProdutoInput
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco,
          sku: formData.sku,
          quantidadeEstoque: formData.quantidadeEstoque,
          imagemUrlPrincipal: formData.imagemUrlPrincipal,
          categoriaId: formData.categoriaId,
      }
    });
  };
  
  // Callback de Sucesso
  onDone((result) => {
    console.log('[AdminCreatePage] Produto criado com sucesso:', result.data?.criarProduto);
    alert(`Produto "${result.data?.criarProduto.nome}" criado com sucesso!`); 
    router.push('/admin/produtos');
  });
  
  // Callback de Erro
  onError((error) => {
    console.error('[AdminCreatePage] Erro ao criar produto:', error);
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      creationError.value = error.graphQLErrors[0].message || 'Erro desconhecido do servidor.';
    } else if (error.networkError) {
      creationError.value = `Erro de rede: ${error.networkError.message}.`;
    } else {
      creationError.value = 'Ocorreu um erro inesperado ao criar o produto.';
    }
  });
  
  </script>
  
  <style scoped>

  </style>