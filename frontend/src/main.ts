// src/main.ts
import { createApp, provide, h } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// --- Apollo Imports ---
import { DefaultApolloClient } from '@vue/apollo-composable';
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context'; // <<< Importar setContext
// ---------------------

// --- Vue Toastification Imports ---
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
// Importe o CSS (ou o tema que preferir)
import "vue-toastification/dist/index.css";
// --------------------------------

import router from './router';
import { useAuthStore } from '@/stores/auth.store'; // <<< Importar o authStore
import './style.css';
import App from './App.vue';

// --- Configuração Pinia ---
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
// --------------------------

// --- Configuração Apollo Client ---
const httpLink = createHttpLink({
  // uri: 'http://localhost:3000/graphql', // URL do seu backend radical
   uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql', // Melhor usar variável de ambiente
});

// --- Middleware (Link) para adicionar o Header Authorization ---
const authLink = setContext((_, { headers }) => {
  // Obtém o store DENTRO do contexto do link, passando a instância pinia
  const authStore = useAuthStore(pinia);
  const token = authStore.token; // Pega o token reativo do store

  console.log('[Apollo AuthLink] Token sendo anexado:', token ? token.substring(0, 10) + '...' : 'Nenhum');

  // Retorna os headers para a próxima etapa do link
  return {
    headers: {
      ...headers, // Mantém os headers existentes
      // Adiciona o header Authorization se o token existir
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});
// ---------------------------------------------------------

// Cache do Apollo
const cache = new InMemoryCache();

// Cria a instância do Apollo Client combinando os links
// IMPORTANTE: authLink vem ANTES de httpLink
const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]), // <<< Combina os links
  cache,
  // Opcional: conectar ao devtools do Apollo (bom para debug)
  connectToDevTools: import.meta.env.DEV,
});
// --- Fim Configuração Apollo Client ---

// --- Criação da App Vue ---
const app = createApp({
  setup () {
    // Prove o cliente Apollo para toda a aplicação
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.use(pinia); // Usa Pinia
app.use(router); // Usa Vue Router

// --- Configuração Vue Toastification ---
const toastOptions: PluginOptions = {
  // Você pode definir opções padrão aqui
  position: POSITION.TOP_RIGHT, // Posição na tela
  timeout: 4000, // Tempo em milissegundos (4 segundos)
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true, // Mostra ícones padrão (sucesso, erro, etc.)
  rtl: false
};
app.use(Toast, toastOptions); // <<< Registrar o plugin com as opções
// -----------------------------------

app.mount('#app'); // Monta a aplicação