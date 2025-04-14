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
  import type { ProdutoOutput } from '@/types/produto.output'; // <<< CRIE ESTE TIPO
  // Tipo dos dados emitidos pelo formulário (precisa ser compatível com CriarProdutoInput)
  // Se você definiu ProdutoFormData em AdminProductForm, pode importar, senão defina aqui

  
  
  // --- Estado ---
  const creationError = ref<string | null>(null); // Mensagem de erro específica desta página
  const router = useRouter();                   // Para redirecionamento
  
  // --- GraphQL Mutation ---
  // Certifique-se que os campos retornados aqui existem no seu ProdutoOutput
  const CRIAR_PRODUTO_MUTATION = gql`
    mutation CriarProdutoAdmin($dados: CriarProdutoInput!) {
      criarProduto(dados: $dados) {
        id
        nome
        sku
      }
    }
  `;
  
  // --- Configuração useMutation ---
  const {
    mutate: executarCriarProduto,
    loading, // Usaremos para desabilitar o botão no formulário filho
    onError,
    onDone,
  } = useMutation<{ criarProduto: ProdutoOutput }>(
      CRIAR_PRODUTO_MUTATION,
      // Opção para invalidar cache de queries após a criação (ex: lista de produtos)
      // () => ({
      //   refetchQueries: ['NomeDaSuaQueryDeListarProdutos'], // Substitua pelo nome real
      // })
  );
  
  // --- Handler para o evento @submit do formulário ---
  const handleCreateProduct = (formData: ProdutoFormData) => {
    creationError.value = null; // Limpa erro anterior
    console.log('[AdminCreatePage] Recebido submit do form:', formData);
  
    // Chama a mutation GraphQL com os dados recebidos do formulário
    executarCriarProduto({
      dados: { // Garante que o objeto passado corresponde ao CriarProdutoInput
          nome: formData.nome,
          descricao: formData.descricao,
          preco: formData.preco, // Já deve ser number
          sku: formData.sku,
          quantidadeEstoque: formData.quantidadeEstoque, // Já deve ser number
          imagemUrlPrincipal: formData.imagemUrlPrincipal,
          categoriaId: formData.categoriaId,
      }
    });
  };
  
  // --- Callback de Sucesso ---
  onDone((result) => {
    console.log('[AdminCreatePage] Produto criado com sucesso:', result.data?.criarProduto);
    alert(`Produto "${result.data?.criarProduto.nome}" criado com sucesso!`); // Feedback simples por enquanto
    // Redireciona para uma página de lista de produtos (mesmo que ainda não exista)
    // ou para um dashboard admin
    router.push('/admin/produtos'); // Ou router.push('/admin');
  });
  
  // --- Callback de Erro ---
  onError((error) => {
    console.error('[AdminCreatePage] Erro ao criar produto:', error);
    if (error.graphQLErrors && error.graphQLErrors.length > 0) {
      // Pega erro vindo do backend (ex: SKU duplicado)
      creationError.value = error.graphQLErrors[0].message || 'Erro desconhecido do servidor.';
    } else if (error.networkError) {
      creationError.value = `Erro de rede: ${error.networkError.message}.`;
    } else {
      creationError.value = 'Ocorreu um erro inesperado ao criar o produto.';
    }
  });
  
  </script>
  
  <style scoped>
  /* Estilos adicionais para a página, se necessário */
  </style>