/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}", // Garante que o Tailwind 'veja' seus arquivos Vue/TS/JS
    ],
    theme: {
      extend: {
        // Adicione suas cores personalizadas aqui depois, se quiser
        colors: {
          'azul-radical': '#0052cc', // Exemplo
          'vermelho-radical': '#e53e3e', // Exemplo
        },
      },
    },
    plugins: [],
  }