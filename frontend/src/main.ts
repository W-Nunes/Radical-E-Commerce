import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import { createPinia } from 'pinia'
import router from './router' // <<< 1. IMPORTAR O ROUTER
import './style.css'
import App from './App.vue'

// ... (configuração httpLink, cache, apolloClient como antes) ...
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
})
const cache = new InMemoryCache()
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})


// --- Criar instância do Pinia ---
const pinia = createPinia() // <<< 2. CRIAR A INSTÂNCIA
// --------------------------------


const app = createApp({
  setup () {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.use(router) // <<< 2. USAR O ROUTER NA APLICAÇÃO
app.use(pinia)

app.mount('#app')