// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
// Importa o store de autenticação para ser usado no guard
import { useAuthStore } from '@/stores/auth.store';

// Definição das Rotas com campos 'meta'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/ListaProdutos.vue')
    // meta: {} // Nenhuma meta especial = Rota pública
  },
  {
    path: '/produto/:id',
    name: 'DetalheProduto',
    component: () => import('@/views/DetalheProduto.vue')
    // meta: {} // Rota pública
  },
  {
    path: '/carrinho',
    name: 'Carrinho',
    component: () => import('@/views/PaginaCarrinho.vue'),
    meta: { requiresAuth: false } // Exemplo: Carrinho pode ser visto sem login, mas o checkout exigirá
    // Se o carrinho SÓ puder ser acessado logado, mude para:
    // meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginPage.vue'),
    meta: { requiresGuest: true } // <<< Apenas para não logados
  },
  {
    path: '/registrar',
    name: 'Registro',
    component: () => import('../views/RegisterPage.vue'),
    meta: { requiresGuest: true } // <<< Apenas para não logados
  },

  // --- Exemplo de Rota Protegida (adicionar depois um componente real) ---
  // {
  //   path: '/perfil',
  //   name: 'PerfilUsuario',
  //   component: () => import('@/views/ProfilePage.vue'), // Criar este componente
  //   meta: { requiresAuth: true } // <<< Exige autenticação
  // },
  // {
  //   path: '/checkout',
  //   name: 'Checkout',
  //   component: () => import('@/views/CheckoutPage.vue'), // Criar este componente
  //   meta: { requiresAuth: true } // <<< Exige autenticação
  // },
  // --------------------------------------------------------------------
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// --- GUARDA DE NAVEGAÇÃO GLOBAL ---
router.beforeEach((to, from, next) => {
  // Obtém o store de autenticação DENTRO do guard, pois ele só está
  // disponível após a inicialização do Pinia em main.ts
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  console.log(`[Router Guard] Navegando para: ${to.path}, requiresAuth: ${requiresAuth}, requiresGuest: ${requiresGuest}, isAuthenticated: ${authStore.isAuthenticated}`);

  if (requiresAuth && !authStore.isAuthenticated) {
    // Se a rota exige login e usuário NÃO está logado -> redireciona para Login
    console.log('[Router Guard] Acesso negado (requer auth). Redirecionando para /login.');
    next({ name: 'Login', query: { redirect: to.fullPath } }); // Opcional: query para redirecionar de volta após login
  } else if (requiresGuest && authStore.isAuthenticated) {
    // Se a rota é só para visitantes e usuário JÁ está logado -> redireciona para Home
    console.log('[Router Guard] Acesso negado (requer guest). Redirecionando para /.');
    next({ name: 'Home' });
  } else {
    // Em todos os outros casos, permite a navegação
    next();
  }
});
// --- FIM GUARDA DE NAVEGAÇÃO ---

export default router;