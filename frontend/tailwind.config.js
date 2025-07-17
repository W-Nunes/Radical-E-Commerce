// Edite o arquivo: frontend/tailwind.config.js

const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'azul-radical': '#0052cc',
          'vermelho-radical': '#e53e3e',
        },
        textShadow: {
          'glow-blue': '0 0 8px rgba(0, 82, 204, 0.7), 0 0 20px rgba(0, 82, 204, 0.5)',
          'glow-red': '0 0 8px rgba(229, 62, 62, 0.7), 0 0 20px rgba(229, 62, 62, 0.5)',
        },
      },
    },
    plugins: [
      require('@tailwindcss/aspect-ratio'),
      // A sintaxe aqui é a chave da correção.
      plugin(function({ addUtilities, theme }) {
        const newUtilities = {
          '.text-shadow-glow-blue': {
            textShadow: theme('textShadow.glow-blue'),
          },
          '.text-shadow-glow-red': {
            textShadow: theme('textShadow.glow-red'),
          },
        }
        addUtilities(newUtilities)
      })
    ],
}