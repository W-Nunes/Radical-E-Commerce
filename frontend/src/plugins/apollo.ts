// radical/frontend/src/plugins/apollo.ts
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";
// Não importar a store aqui

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql',
});

// Middleware para adicionar o Header Authorization lendo do localStorage
const authLink = setContext((_, { headers }) => {
  let token: string | null = null;
  // Tenta ler diretamente do localStorage onde o pinia-persist salva
  // A chave padrão para a store 'auth' é 'auth'
  const persistedAuth = localStorage.getItem('auth');
  if (persistedAuth) {
    try {
      token = JSON.parse(persistedAuth).token; // Pega o token de dentro do objeto salvo
    } catch (e) {
      console.error("Erro ao parsear token persistido no Apollo link:", e);
    }
  }

  // console.log('[Apollo AuthLink] Token do localStorage:', token ? token.substring(0, 10) + '...' : 'Nenhum');

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) graphQLErrors.forEach(({ message }) => console.error(`[GraphQL error]: ${message}`));
    if (networkError) console.error(`[Network error]: ${networkError}`);
});

const cache = new InMemoryCache();

// Cliente ÚNICO, configurado aqui
const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
  connectToDevTools: import.meta.env.DEV,
});

export default apolloClient;