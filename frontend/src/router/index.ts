import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router'; // Importa APENAS o TIPO RouteRecordRaw
// Importe o componente da sua lista de produtos
import ListaProdutos from '../components/ListaProdutos.vue'; // Ajuste o caminho se necessário

// Define as rotas da aplicação
const routes: Array<RouteRecordRaw> = [
  {
    path: '/', // A rota raiz da aplicação
    name: 'Home', // Nome da rota (opcional, mas útil)
    component: ListaProdutos, // Renderiza a lista de produtos na raiz
  },
  
  {
    path: '/produto/:id', // Exemplo de rota dinâmica
    name: 'DetalheProduto',
    component: () => import('../views/DetalheProduto.vue') // Exemplo com lazy loading
   },

   {
    path: '/carrinho', // URL para acessar o carrinho
    name: 'Carrinho', // Nome da rota
    // Componente da página do carrinho (usando lazy loading)
    component: () => import('../views/PaginaCarrinho.vue') // Criaremos este arquivo a seguir
  }

];


// Cria a instância do roteador
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Usa o modo de histórico do HTML5
  routes, // Passa as rotas definidas
});

// Exporta o roteador para ser usado no main.ts
export default router;