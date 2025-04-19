<template>
  <form @submit.prevent="onSubmit" class="space-y-4">

    <div>
      <label for="nome" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome do Produto:</label>
      <input type="text" id="nome" v-model="formData.nome" required
             class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
             </div>

    <div>
      <label for="sku" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">SKU:</label>
      <input type="text" id="sku" v-model="formData.sku" required
             class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
             </div>

    <div>
      <label for="preco" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Preço (R$):</label>
      <input type="number" id="preco" v-model.number="formData.preco" required step="0.01" min="0.01"
             class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
             </div>

    <div>
      <label for="quantidadeEstoque" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Estoque:</label>
      <input type="number" id="quantidadeEstoque" v-model.number="formData.quantidadeEstoque" required min="0" step="1"
             class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
             </div>

    <div>
      <label for="categoria" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Categoria:</label>
      <select id="categoria" v-model="formData.categoriaId" required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
              <option :value="null" disabled>
             {{ loadingCategorias ? 'Carregando...' : (errorCategorias ? 'Erro!' : 'Selecione uma categoria') }}
        </option>
        <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
          {{ cat.nome }}
        </option>
      </select>
       <p v-if="errorCategorias" class="text-red-500 text-xs italic mt-1">Não foi possível carregar as categorias.</p>
    </div>

    <div>
      <label for="descricao" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Descrição:</label>
      <textarea id="descricao" v-model="formData.descricao" rows="4"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"></textarea>
                </div>

     <div>
      <label for="imagemUrlPrincipal" class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">URL da Imagem Principal:</label>
      <input type="url" id="imagemUrlPrincipal" v-model="formData.imagemUrlPrincipal" placeholder="https://..."
             class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul-radical dark:focus:ring-offset-gray-800 focus:border-azul-radical/0 sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
             </div>

    <div class="pt-4">
      <button type="submit" :disabled="isSubmitting || loadingCategorias || !formData.categoriaId"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
         {{ isSubmitting ? 'Salvando...' : 'Salvar Produto' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';
import type { CategoriaOutput } from '@/types/categoria.output'; // <<< CRIAR ESTE TIPO

// --- Tipagem para os dados do formulário ---
// Corresponde ao CriarProdutoInput/EditarProdutoInput do backend
export interface ProdutoFormData {
  nome: string;
  descricao: string | null;
  preco: number | null; // Começa como null para validação
  sku: string;
  quantidadeEstoque: number | null; // Começa como null
  imagemUrlPrincipal: string | null;
  categoriaId: string | null; // ID da categoria selecionada
}

// --- Props ---
// Recebe dados iniciais (para o modo de edição) e estado de submissão
const props = defineProps<{
  initialData?: Partial<ProdutoFormData>; // Dados iniciais (opcional)
  isSubmitting?: boolean; // Indica se o pai está submetendo (opcional)
}>();

// --- Emits ---
// Emite o evento 'submit' com os dados do formulário quando enviado
const emit = defineEmits<{
  (e: 'submit', formData: ProdutoFormData): void;
}>();

// --- Estado Reativo do Formulário ---
// Usamos reactive para o objeto do formulário
const formData = reactive<ProdutoFormData>({
  nome: '',
  descricao: null,
  preco: null,
  sku: '',
  quantidadeEstoque: 0, // Default 0
  imagemUrlPrincipal: null,
  categoriaId: null, // Começa nulo
  // ... inicializar outros campos ...
});

// --- Observador para preencher o form com dados iniciais (para edição) ---
watch(() => props.initialData, (newData) => {
  if (newData) {
    // Preenche o formData com os dados recebidos
    Object.assign(formData, newData);
    // Garantir que números sejam tratados corretamente se vierem como string ou null
    formData.preco = newData.preco ? Number(newData.preco) : null;
    formData.quantidadeEstoque = newData.quantidadeEstoque !== undefined && newData.quantidadeEstoque !== null ? Number(newData.quantidadeEstoque) : 0;
    // Categoria já deve vir como categoriaId em initialData se for edição
  }
}, { immediate: true }); // Executa imediatamente ao montar


// --- Busca de Categorias ---
const CATEGORIAS_QUERY = gql`
  query BuscarCategoriasAdmin {
    categorias {
      id
      nome
    }
  }
`;
const {
  result: resultCategorias, // Dados retornados
  loading: loadingCategorias, // Estado de carregamento
  error: errorCategorias    // Objeto de erro
} = useQuery<{ categorias: CategoriaOutput[] }>(CATEGORIAS_QUERY);

// Getter computado para facilitar o acesso às categorias
const categorias = computed(() => resultCategorias.value?.categorias ?? []);

// --- Submissão ---
const onSubmit = () => {
   // Garante que categoria foi selecionada
   if (!formData.categoriaId) {
     alert('Por favor, selecione uma categoria.');
     return;
   }
   // Garante que preço e estoque são números válidos
   if (formData.preco === null || formData.preco <= 0) {
     alert('Por favor, insira um preço válido.');
     return;
   }
   if (formData.quantidadeEstoque === null || formData.quantidadeEstoque < 0) {
      alert('Por favor, insira uma quantidade de estoque válida (0 ou mais).');
      return;
   }
   console.log('[AdminProductForm] Emitindo submit:', formData);
   // Emite os dados do formulário para o componente pai lidar com a mutation
   emit('submit', { ...formData });
};

// --- Log de erros de categorias (opcional) ---
watch(errorCategorias, (newError) => {
  if (newError) {
    console.error("[AdminProductForm] Erro ao buscar categorias:", newError);
  }
});

</script>