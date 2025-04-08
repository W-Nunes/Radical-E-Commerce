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
   }
];

// Cria a instância do roteador
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Usa o modo de histórico do HTML5
  routes, // Passa as rotas definidas
});

// Exporta o roteador para ser usado no main.ts
export default router;