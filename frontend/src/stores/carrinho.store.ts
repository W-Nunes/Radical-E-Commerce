import { defineStore } from 'pinia';
import { ref, computed } from 'vue'; // Importamos ref e computed do Vue

// --- Interface para um Item no Carrinho ---
// Precisamos definir como será um item DENTRO do carrinho
// Inclui os dados do produto que queremos guardar + a quantidade
interface ProdutoParaCarrinho {
    id: string;
    nome: string;
    preco: number;
    imagemUrlPrincipal: string | null;
    // Não precisamos de todos os detalhes do produto aqui, só o necessário para o carrinho
}

export interface ItemCarrinho extends ProdutoParaCarrinho {
    quantidade: number;
}
// ----------------------------------------

// --- Definindo o Store ---
// 'defineStore' cria o store. O primeiro argumento é um ID único ('carrinho').
// O segundo argumento é uma função setup (estilo Composition API) ou um objeto de opções.
// Vamos usar a função setup, que é mais moderna com Vue 3.
export const useCarrinhoStore = defineStore('carrinho', () => {

  // --- STATE (Estado) ---
  // Usamos 'ref' para criar propriedades de estado reativas.
  // 'items' será um array contendo objetos do tipo ItemCarrinho.
  const items = ref<ItemCarrinho[]>([]);

  // --- GETTERS (Computados) ---
  // Getters são como propriedades computadas para o store.
  const totalItens = computed(() => {
    // Soma a 'quantidade' de cada item no carrinho
    return items.value.reduce((total, item) => total + item.quantidade, 0);
  });

  const valorTotal = computed(() => {
    // Multiplica o 'preco' pela 'quantidade' de cada item e soma tudo
    return items.value.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  });

  // Getter simples para acessar a lista (poderia ser usado direto 'items.value' também)
  const listaItens = computed(() => items.value);

  // --- ACTIONS (Ações/Métodos) ---
  // Actions são funções que podem modificar o estado ('items.value').

  /**
   * Adiciona um produto ao carrinho.
   * Se o produto já existir, incrementa a quantidade.
   * @param produto O objeto do produto a ser adicionado (precisa ter id, nome, preco, imagemUrlPrincipal)
   */
  function adicionarItem(produto: ProdutoParaCarrinho) {
    const itemExistente = items.value.find(item => item.id === produto.id);

    if (itemExistente) {
      // Se o item já existe, apenas incrementa a quantidade
      itemExistente.quantidade++;
      console.log(`Quantidade do item ${produto.nome} incrementada para ${itemExistente.quantidade}`);
    } else {
      // Se é um item novo, adiciona ao array com quantidade 1
      items.value.push({ ...produto, quantidade: 1 });
      console.log(`Item ${produto.nome} adicionado ao carrinho.`);
    }
    // TODO: Persistir carrinho no localStorage talvez?
  }

  /**
   * Remove um item completamente do carrinho.
   * @param produtoId O ID do produto a ser removido.
   */
  function removerItem(produtoId: string) {
    const indice = items.value.findIndex(item => item.id === produtoId);
    if (indice !== -1) {
      const nomeRemovido = items.value[indice].nome;
      items.value.splice(indice, 1); // Remove o item do array
      console.log(`Item ${nomeRemovido} removido do carrinho.`);
    }
  }

  /**
   * Atualiza a quantidade de um item específico no carrinho.
   * Se a quantidade for 0 ou menor, remove o item.
   * @param produtoId O ID do produto a ter a quantidade atualizada.
   * @param quantidade A nova quantidade desejada.
   */
  function atualizarQuantidade(produtoId: string, quantidade: number) {
     const itemParaAtualizar = items.value.find(item => item.id === produtoId);
     if (itemParaAtualizar) {
        if (quantidade <= 0) {
            // Se quantidade for 0 ou negativa, remove o item
            removerItem(produtoId);
        } else {
            itemParaAtualizar.quantidade = quantidade;
            console.log(`Quantidade do item ${itemParaAtualizar.nome} atualizada para ${quantidade}`);
        }
     }
  }

  /**
   * Limpa todos os itens do carrinho.
   */
  function limparCarrinho() {
    items.value = [];
    console.log('Carrinho limpo.');
  }


  // --- EXPORTAR ---
  // Retornamos tudo que queremos que seja acessível de fora do store:
  // o estado (items), os getters (totalItens, valorTotal) e as ações (adicionarItem, etc.)
  return {
    items, // O estado bruto (um ref)
    listaItens, // Getter para a lista
    totalItens, // Getter
    valorTotal, // Getter
    adicionarItem, // Action
    removerItem, // Action
    atualizarQuantidade, // Action
    limparCarrinho, // Action
  }
});