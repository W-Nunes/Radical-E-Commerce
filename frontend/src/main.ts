import { createApp, provide, h } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

// Apollo
import { DefaultApolloClient } from '@vue/apollo-composable';
import apolloClient from './plugins/apollo'; 


// Toastification
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";

import router from './router';
import './style.css';
import App from './App.vue';

// Configuração Pinia
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

// Criação da App Vue
const app = createApp({
  setup () {
    // Prove a instância ÚNICA importada do plugin
    provide(DefaultApolloClient, apolloClient); // Usa o apolloClient importado
  },
  render: () => h(App),
});

app.use(pinia); // Use Pinia ANTES de montar
app.use(router);

// Configuração Toastification (OK)
const toastOptions: PluginOptions = { /* ... suas opções ... */ };
app.use(Toast, toastOptions);
app.mount('#app');