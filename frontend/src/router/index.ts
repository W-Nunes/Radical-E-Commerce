import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

// Definição das Rotas
const routes: Array<RouteRecordRaw> = [
  {
    path: '/promocao',
    name: 'Promocao',
    component: () => import('@/views/PaginaPromocao.vue'),
    meta: { isPromoPage: true }
  },

  {
    path: '/',
    name: 'Home',
    component: () => import('@/components/ListaProdutos.vue')
  },
  {
    path: '/produto/:id',
    name: 'DetalheProduto',
    component: () => import('@/views/DetalheProduto.vue')
  },
  {
    path: '/carrinho',
    name: 'Carrinho',
    component: () => import('@/views/PaginaCarrinho.vue'),
    meta: { requiresAuth: false }
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



  {
    path: '/checkout/endereco', 
    name: 'CheckoutEndereco',   
    component: () => import('@/views/PaginaCheckoutEndereco.vue'),
    meta: { requiresAuth: true } 
  },

  {
      path: '/pedido/sucesso/:id', 
      name: 'PedidoSucesso',
      component: () => import('@/views/PaginaPedidoSucesso.vue'), 
      props: true, 
      meta: { requiresAuth: true }
  },

  {
    path: '/admin/produtos/novo',
    name: 'AdminCriarProduto',
    component: () => import('../views/admin/AdminProductCreatePage.vue'),
    meta: { requiresAuth: true } // <<< Rota protegida!
  },

  {
    path: '/admin/produtos/editar/:id',
    name: 'AdminEditarProduto',
    component: () => import('../views/admin/AdminProductEditPage.vue'), 
    props: true,
    meta: { requiresAuth: true } // Rota protegida
  },

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

// GUARDA DE NAVEGAÇÃO 
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // LÓGICA DE REDIRECIONAMENTO PARA PROMOÇÃO 
  const promoVisto = sessionStorage.getItem('promoVisto');
  if (!promoVisto && to.name !== 'Promocao') {
    sessionStorage.setItem('promoVisto', 'true');
    return next({ name: 'Promocao' });
  }
  

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  console.log(`[Router Guard] Navegando para: ${to.path}, requiresAuth: ${requiresAuth}, requiresGuest: ${requiresGuest}, isAuthenticated: ${authStore.isAuthenticated}`);

  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('[Router Guard] Acesso negado (requer auth). Redirecionando para /login.');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log('[Router Guard] Acesso negado (requer guest). Redirecionando para /.');
    next({ name: 'Home' });
  } else {
    next();
  }
});

export default router;