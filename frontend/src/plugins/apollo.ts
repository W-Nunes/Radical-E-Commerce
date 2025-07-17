
import { ApolloClient, createHttpLink, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from "@apollo/client/link/error";

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'http://localhost:3000/graphql',
});

// Middleware para adicionar o Header Authorization lendo do localStorage
const authLink = setContext((_, { headers }) => {
  let token: string | null = null;
  // Tenta ler do localStorage onde o pinia-persist salva
  const persistedAuth = localStorage.getItem('auth');
  if (persistedAuth) {
    try {
      token = JSON.parse(persistedAuth).token; // Pega o token de dentro do objeto salvo
    } catch (e) {
      console.error("Erro ao parsear token persistido no Apollo link:", e);
    }
  }

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

// Configuração de Cliente ÚNICO
const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache,
  connectToDevTools: import.meta.env.DEV,
});

export default apolloClient;