<template>
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold mb-4">Detalhes do Produto</h1>
      <p v-if="idProduto">ID do Produto recebido pela rota: <strong class="text-azul-radical">{{ idProduto }}</strong></p>
      <p v-else>Carregando ID do produto...</p>
  
      <div class="mt-8 p-4 border rounded bg-gray-100 dark:bg-gray-800">
        <p>(Conteúdo detalhado do produto aparecerá aqui...)</p>
      </div>
  
       <div class="mt-6">
          <router-link to="/" class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            &larr; Voltar para a lista
          </router-link>
       </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  // Importa o hook para acessar informações da rota atual
  import { useRoute } from 'vue-router';
  
  // Cria uma referência reativa para guardar o ID
  const idProduto = ref<string | null>(null);
  
  // Obtém o objeto da rota atual
  const route = useRoute();
  
  // O hook onMounted garante que o código só rode depois do componente ser montado no DOM,
  // quando os parâmetros da rota já estarão disponíveis.
  onMounted(() => {
    // Acessa o parâmetro 'id' definido na rota (path: '/produto/:id')
    const idParam = route.params.id;
    // params pode ser string ou string[], garantimos que seja string
    idProduto.value = Array.isArray(idParam) ? idParam[0] : idParam;
  
    console.log("ID do Produto pego da Rota:", idProduto.value); // Para verificar no console
  });
  
  // Lógica para buscar dados via GraphQL virá aqui depois...
  
  </script>
  
  <style scoped>
  /* Estilos específicos para esta view, se necessário */
  </style>