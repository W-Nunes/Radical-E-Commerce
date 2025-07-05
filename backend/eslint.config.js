// backend/eslint.config.js
const tseslint = require('typescript-eslint');
const nest = require('@nestjs/eslint-plugin');
const path = require('node:path');

module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@typescript-eslint/stylistic',
    ],
    plugins: {
      '@nestjs': nest,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: true,
        // Usa __dirname, que é a variável correta para o módulo commonjs
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    files: ['**/*.js'],
    extends: ['eslint:recommended'],
    languageOptions: {
      globals: {
        process: 'readonly',
        module: 'readonly',
        require: 'readonly',
        __dirname: 'readonly',
      },
    },
  }
);