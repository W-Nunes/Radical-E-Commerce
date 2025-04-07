import { createApp, provide, h } from 'vue'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core'
import './style.css' // Importa o CSS com Tailwind
import App from './App.vue'

// Conexão HTTP para o backend GraphQL
// Certifique-se que a porta (3000 padrão do Nest) está correta
const httpLink = createHttpLink({
  uri: 'http://localhost:3000/graphql',
})

// Cache para otimizar queries repetidas
const cache = new InMemoryCache()

// Cria a instância do cliente Apollo
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
})

// Cria a aplicação Vue
const app = createApp({
  setup () {
    // Disponibiliza o cliente Apollo para toda a aplicação
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.mount('#app') // Monta a aplicação no elemento #app do index.html