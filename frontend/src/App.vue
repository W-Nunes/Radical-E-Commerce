<template>
  <div>
    <header class="bg-gray-800 text-white p-4 text-center">
       <h1 class="text-2xl font-bold">🛹 Loja Radical 🤘</h1>
       </header>

    <main>
      <router-view />
    </main>

    <footer class="bg-gray-200 text-gray-700 p-4 text-center mt-8">
       © {{ new Date().getFullYear() }} Loja Radical - Todos os direitos reservados.
     </footer>
  </div>
</template>

<script setup lang="ts">
// Não precisamos mais importar ListaProdutos aqui
// import ListaProdutos from './components/ListaProdutos.vue';
</script>

<style scoped>
/* Estilos específicos para o layout do App, se necessário */
main {
  min-height: calc(100vh - 10rem); /* Exemplo para empurrar o footer para baixo */
}
</style>