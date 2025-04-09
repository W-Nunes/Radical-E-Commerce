<template>
  <div>

    <header class="bg-gray-800 text-white p-4 flex justify-between items-center"> 
       <h1 class="text-2xl font-bold">
          <router-link to="/">🛹 Loja Radical 🤘</router-link> 
       </h1>
       <div>
          <nav>
            <span class="text-lg">
                🛒 Carrinho ({{ carrinhoStore.totalItens }})
            </span>
            <router-link to="/carrinho" class="hover:text-gray-300">Ver Carrinho</router-link>
            </nav>
       </div>
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
  import { useCarrinhoStore } from '@/stores/carrinho.store';
  const carrinhoStore = useCarrinhoStore();
</script>

<style scoped>
/* Estilos específicos para o layout do App, se necessário */
main {
  min-height: calc(100vh - 10rem); /* Exemplo para empurrar o footer para baixo */
}
</style>