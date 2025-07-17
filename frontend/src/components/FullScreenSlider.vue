<template>
    <section class="relative w-full h-screen bg-gray-900 text-white flex items-center justify-center overflow-hidden">
      <transition-group
        name="slide-fade"
        tag="div"
        class="absolute inset-0 w-full h-full"
      >
        <div
          v-for="(slide, index) in slides"
          :key="slide.img"
          v-show="currentSlideIndex === index"
          class="absolute inset-0 w-full h-full"
        >
          <div class="absolute inset-0 w-full h-full bg-black">
            <img :src="slide.img" class="w-full h-full object-cover opacity-40" :alt="slide.title">
          </div>
  
          <div class="relative w-full h-full container mx-auto px-4 grid md:grid-cols-2 items-center gap-8">
            
            <div class="hidden md:flex justify-center items-center group" style="perspective: 1000px;">
               <img 
                 :src="slide.img" 
                 class="max-h-[70vh] w-auto object-contain rounded-lg shadow-2xl transition-transform duration-500 ease-in-out" 
                 :class="{
                   'group-hover:[transform:rotateY(180deg)]': slide.animation === 'flip',
                 }"
                 :alt="slide.title"
               >
            </div>
  
            <div class="text-center md:text-left flex flex-col items-center md:items-start">
              <h2 class="text-4xl lg:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
                {{ slide.title }}
              </h2>
              <p class="text-lg lg:text-xl text-gray-300 mb-8 max-w-md">
                {{ slide.description }}
              </p>
              <router-link :to="slide.link" class="inline-block bg-azul-radical hover:bg-opacity-80 text-white font-bold py-3 px-8 rounded-md transition duration-200 text-lg">
                Ver Produtos
              </router-link>
            </div>
          </div>
        </div>
      </transition-group>
  
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4 z-10">
        <button @click="prevSlide" class="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button @click="nextSlide" class="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center transition">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import imgStreet from '@/assets/img_3.jpg';
  import imgVert from '@/assets/img_1.jpg';
  import imgBmx from '@/assets/img_2.jpg';
  import imgLongboard from '@/assets/img_4.jpg';
  
  const slides = [
    {
      img: imgStreet,
      title: 'Equipamento de Street',
      description: 'Shapes, trucks e rodas feitos para aguentar o impacto das ruas. Performance e durabilidade para suas manobras.',
      link: '/?categoria=shapes',
      animation: 'flip'
    },
    {
      img: imgVert,
      title: 'Vertical e Transições',
      description: 'Skates completos e equipamentos de proteção para você voar alto em pistas e half-pipes com segurança.',
      link: '/?categoria=skates-montados',
      animation: 'flip'
    },
    {
      img: imgBmx,
      title: 'BMX: Peças e Bikes',
      description: 'Do quadro ao guidão, encontre as melhores peças para montar ou dar um upgrade na sua bike de BMX.',
      link: '/?categoria=bmx',
      animation: 'flip'
    },
    {
      img: imgLongboard,
      title: 'Acessórios para Downhill',
      description: 'Capacetes, luvas e rodas de alta performance para quem busca velocidade e adrenalina no asfalto.',
      link: '/?categoria=acessorios',
      animation: 'flip'
    }
  ];
  
  const currentSlideIndex = ref(0);
  let slideInterval: any;
  
  const nextSlide = () => {
    currentSlideIndex.value = (currentSlideIndex.value + 1) % slides.length;
  };
  
  const prevSlide = () => {
    currentSlideIndex.value = (currentSlideIndex.value - 1 + slides.length) % slides.length;
  };
  
  onMounted(() => {
    slideInterval = setInterval(nextSlide, 7000);
  });
  
  onUnmounted(() => {
    clearInterval(slideInterval);
  });
  </script>
  
  <style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: opacity 0.8s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
  }
  .group:hover .group-hover\:\[transform\:rotateY\(180deg\)\] {
    transform-style: preserve-3d;
  }
  </style>