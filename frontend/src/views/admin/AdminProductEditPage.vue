<template>
    <div class="container mx-auto p-4">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Editar Produto</h2>
  
      <div v-if="loadingProduto" class="text-center py-10">
        <p class="text-gray-500 dark:text-gray-400">Carregando dados do produto...</p>
        </div>
  
      <div v-else-if="errorProduto || !produtoData" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Erro ao carregar!</strong>
        <span class="block sm:inline"> {{ errorProduto?.message || 'Não foi possível carregar os dados do produto.' }}</span>
        <router-link to="/admin" class="ml-4 underline">Voltar</router-link> </div>
  
      <div v-else>
        <div v-if="updateError" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Erro ao salvar!</strong>
          <span class="block sm:inline"> {{ updateError }}</span>
        </div>
  
        <AdminProductForm
          :initial-data="formDataForForm"
          :is-submitting="loadingUpdate"
          @submit="handleUpdateProduct"
        />
        </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { useQuery, useMutation } from '@vue/apollo-composable';
  import gql from 'graphql-tag';
  
  import AdminProductForm from '@/components/admin/AdminProductForm.vue';
  // Importa os tipos necessários
  import type { ProdutoOutput } from '@/types/produto.output';
  import type { ProdutoFormData } from '@/components/admin/AdminProductForm.vue'; // Importa do Form
  
  // --- Props ---
  // Recebe o 'id' da rota graças ao 'props: true' no router/index.ts
  const props = defineProps<{
    id: string; // ID do produto vindo da URL
  }>();
  
  // --- Estado ---
  const updateError = ref<string | null>(null); // Erro da mutation de update
  const router = useRouter();
  
  // --- Query para buscar dados do produto ---
  const PRODUTO_QUERY = gql`
    query BuscarProdutoParaEdicao($id: ID!) {
      produto(id: $id) {
        id
        nome
        descricao
        preco
        sku
        quantidadeEstoque
        imagemUrlPrincipal
        categoria {
          id # Precisamos do ID da categoria para o select do formulário
          # nome # Opcional, não usado diretamente pelo form
        }
      }
    }
  `;
  
  const {
    result: resultProduto, // Onde os dados do produto ficarão
    loading: loadingProduto, // Estado de carregamento da query
    error: errorProduto,    // Erro da query
    // refetch: refetchProduto // Função para recarregar, se necessário
  } = useQuery<{ produto: ProdutoOutput | null }>(
    PRODUTO_QUERY,
    { id: props.id }, // Passa o ID da prop como variável para a query
    () => ({
       // fetchPolicy: 'cache-and-network', // Exemplo: buscar sempre da rede além do cache
       // enabled: !!props.id, // Garante que a query só roda se o ID existir
    })
  );
  
  // Dados do produto retornado pela query
  const produtoData = computed(() => resultProduto.value?.produto);
  
  // Mapeia os dados carregados para o formato esperado pelo AdminProductForm
  // Usamos computed para que formDataForForm reaja a mudanças em produtoData
  const formDataForForm = computed<Partial<ProdutoFormData>>(() => {
      if (!produtoData.value) {
          return {}; // Retorna objeto vazio se não houver dados
      }
      // Mapeia os campos da query para a estrutura do ProdutoFormData
      return {
          nome: produtoData.value.nome,
          descricao: produtoData.value.descricao,
          preco: produtoData.value.preco,
          sku: produtoData.value.sku,
          quantidadeEstoque: produtoData.value.quantidadeEstoque,
          imagemUrlPrincipal: produtoData.value.imagemUrlPrincipal,
          categoriaId: produtoData.value.categoria?.id, // Pega o ID da categoria aninhada
      };
  });
  
  // --- Mutation para editar o produto ---
  const EDITAR_PRODUTO_MUTATION = gql`
    mutation EditarProdutoAdmin($id: ID!, $dados: EditarProdutoInput!) {
      editarProduto(id: $id, dados: $dados) {
        id # Retorna ID para confirmação
        nome # Retorna nome atualizado
      }
    }
  `;
  
  const {
    mutate: executarEditarProduto,
    loading: loadingUpdate, // Loading da mutation de update
    onError: onErrorUpdate,
    onDone: onDoneUpdate,
  } = useMutation<{ editarProduto: Pick<ProdutoOutput, 'id' | 'nome'> }>(EDITAR_PRODUTO_MUTATION);
  
  // --- Handler para o evento @submit do formulário ---
  const handleUpdateProduct = (formData: ProdutoFormData) => {
    updateError.value = null; // Limpa erro anterior
    console.log('[AdminEditPage] Recebido submit do form para update:', formData);
  
    // Precisamos garantir que os campos numéricos sejam enviados como números
    const dadosParaEnviar = {
        ...formData,
        preco: formData.preco !== null ? Number(formData.preco) : undefined, // Converte para número ou omite
        quantidadeEstoque: formData.quantidadeEstoque !== null ? Number(formData.quantidadeEstoque) : undefined, // Converte para número ou omite
        // Se descrição ou imagem for string vazia, envia null (ou string vazia dependendo da API)
        descricao: formData.descricao === '' ? null : formData.descricao,
        imagemUrlPrincipal: formData.imagemUrlPrincipal === '' ? null : formData.imagemUrlPrincipal,
    };
  
    // Remove campos que não foram modificados ou são nulos/undefined se a API não os aceitar
    // (O DTO EditarProdutoInput já lida com campos opcionais, então isso pode não ser necessário)
    // Object.keys(dadosParaEnviar).forEach(key => {
    //    if (dadosParaEnviar[key] === undefined || dadosParaEnviar[key] === null) {
    //       delete dadosParaEnviar[key];
    //    }
    // });
  
  
    executarEditarProduto({
      id: props.id, // O ID do produto que estamos editando
      dados: dadosParaEnviar // Os dados (apenas os modificados se o form tratar isso)
    });
  };
  
  // --- Callback de Sucesso do Update ---
  onDoneUpdate((result) => {
    console.log('[AdminEditPage] Produto atualizado com sucesso:', result.data?.editarProduto);
    alert(`Produto "${result.data?.editarProduto.nome}" atualizado com sucesso!`);
    // Redireciona de volta para a lista (ou dashboard)
    router.push('/admin/produtos'); // Ou /admin
  });
  
  // --- Callback de Erro do Update ---
  onErrorUpdate((error) => {
    console.error('[AdminEditPage] Erro ao atualizar produto:', error);
     if (error.graphQLErrors && error.graphQLErrors.length > 0) {
       updateError.value = error.graphQLErrors[0].message || 'Erro desconhecido do servidor.';
     } else if (error.networkError) {
       updateError.value = `Erro de rede: ${error.networkError.message}.`;
     } else {
       updateError.value = 'Ocorreu um erro inesperado ao atualizar o produto.';
     }
  });
  
  // Log quando o produto é carregado (para debug)
  watch(produtoData, (novoProduto) => {
      if(novoProduto) {
          console.log('[AdminEditPage] Dados do produto carregados:', novoProduto);
      }
  });
  
  </script>
  
  <style scoped>
  /* Estilos adicionais, se necessário */
  </style>