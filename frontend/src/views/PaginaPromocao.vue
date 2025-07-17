<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">
    <video 
      class="absolute top-1/2 left-1/2 w-auto min-w-full min-h-full max-w-none -translate-x-1/2 -translate-y-1/2 z-0 opacity-40" 
      autoplay muted loop playsinline
    >
      <source :src="videoSource" type="video/mp4">
      Seu navegador não suporta vídeos.
    </video>

    <div class="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 text-white">
      
      <div v-if="loading" class="text-center">
        <p class="text-2xl animate-pulse">Carregando promoções...</p>
      </div>

      <template v-else-if="slides.length > 0">
        <transition name="layout-shift" mode="out-in">
          <div 
            :key="currentSlide.product.id"
            :class="showProductCard 
              ? 'flex flex-col md:grid md:grid-cols-2 gap-8 items-center w-full max-w-6xl'  // <-- CORREÇÃO RESPONSIVA AQUI
              : 'flex flex-col items-center justify-center text-center'"
          >
            <div class="text-center md:text-left">
              <h1 class="text-5xl md:text-7xl font-black uppercase tracking-wider text-shadow-glow-blue">
                {{ currentSlide.mainText.line1 }}
              </h1>
              <h2 class="text-6xl md:text-8xl font-black uppercase text-shadow-glow-red">
                {{ currentSlide.mainText.line2 }}
              </h2>
              <p v-if="showProductCard" class="mt-4 text-lg text-gray-300 max-w-md mx-auto md:mx-0">
                {{ currentSlide.product.descricao }}
              </p>
            </div>

            <transition name="fade">
              <div v-if="showProductCard" class="flex justify-center w-full mt-8 md:mt-0">
                <div class="w-full max-w-xs bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 text-center">
                  <img :src="currentSlide.product.imagemUrlPrincipal!" :alt="currentSlide.product.nome" class="w-full rounded-md mb-4 h-52 object-contain">
                  <h3 class="font-bold text-xl">{{ currentSlide.product.nome }}</h3>
                  <p class="text-sm text-gray-300">{{ currentSlide.product.descricao?.substring(0, 70) }}...</p>
                </div>
              </div>
            </transition>
          </div>
        </transition>

        <transition name="fade">
          <div v-if="showProductCard" class="absolute bottom-10 flex flex-row items-center gap-4">
            <router-link :to="{ name: 'DetalheProduto', params: { id: currentSlide.product.id } }" @click="marcarComoVisto" class="bg-azul-radical hover:bg-opacity-80 text-white font-bold py-3 px-10 rounded-md text-lg transition-all duration-300 transform hover:scale-105">
              Confira
            </router-link>
            <router-link to="/" @click="marcarComoVisto" class="font-bold py-3 px-10 rounded-md text-lg transition-colors hover:text-azul-radical">
              Entrar no site
            </router-link>
          </div>
        </transition>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import apolloClient from '@/plugins/apollo';
import gql from 'graphql-tag';
import videoBg from '@/assets/background-video.mp4';
import type { ProdutoOutput } from '@/types/produto.output';

interface Slide {
  mainText: { line1: string; line2: string };
  product: ProdutoOutput;
}

const promoData = [
  { sku: 'SKT-ELM-SEC01', mainText: { line1: 'Performance', line2: 'Nas Alturas' } },
  { sku: 'BMX-CLT-CREWHB', mainText: { line1: 'Manobras', line2: 'Insanas' } },
  { sku: 'ACS-PTC-CLSCERT', mainText: { line1: 'Proteção', line2: 'Com Estilo' } }
];

const PRODUTO_POR_SKU_QUERY = gql`
  query ProdutoPorSku($sku: String!) {
    produtoPorSku(sku: $sku) {
      id
      nome
      descricao
      imagemUrlPrincipal
    }
  }
`;

const slides = ref<Slide[]>([]);
const loading = ref(true);

const fetchPromoProducts = async () => {
  try {
    const promises = promoData.map(promoItem => 
      apolloClient.query<{ produtoPorSku: ProdutoOutput }>({
        query: PRODUTO_POR_SKU_QUERY,
        variables: { sku: promoItem.sku }
      })
    );
    const results = await Promise.all(promises);
    
    slides.value = results
      .map((result, index) => ({
        mainText: promoData[index].mainText,
        product: result.data.produtoPorSku,
      }))
      .filter((slide): slide is Slide => !!slide.product); 

  } catch (error) {
    console.error("Erro ao buscar produtos da promoção:", error);
  } finally {
    loading.value = false;
  }
};

const videoSource = ref(videoBg);
const showProductCard = ref(false);
const currentSlideIndex = ref(0);
let slideInterval: any;

const currentSlide = computed(() => slides.value[currentSlideIndex.value] || { product: {}, mainText: {} });

const nextSlide = () => {
  if (slides.value.length > 0) {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.value.length;
  }
};

const marcarComoVisto = () => {
  sessionStorage.setItem('promoVisto', 'true');
};

onMounted(() => {
  fetchPromoProducts();
  setTimeout(() => { showProductCard.value = true; }, 3000);
  slideInterval = setInterval(nextSlide, 7000); 
});

onUnmounted(() => {
  clearInterval(slideInterval);
});
</script>

<style scoped>
.text-shadow-glow-blue { text-shadow: 0 0 8px rgba(0, 82, 204, 0.7), 0 0 20px rgba(0, 82, 204, 0.5); }
.text-shadow-glow-red { text-shadow: 0 0 8px rgba(229, 62, 62, 0.7), 0 0 20px rgba(229, 62, 62, 0.5); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.8s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.layout-shift-enter-active, .layout-shift-leave-active { transition: all 0.8s ease-in-out; }
</style>