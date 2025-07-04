# Estágio 1: Build da Aplicação
# Usamos uma imagem Node.js como base
FROM node:18-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências de produção
RUN npm install --only=production

# Copia o restante do código da aplicação
COPY . .

# Compila o TypeScript para JavaScript
RUN npm run build

# Estágio 2: Imagem Final de Produção
# Usamos uma imagem menor para a versão final
FROM node:18-alpine

WORKDIR /usr/src/app

# Copia as dependências de produção do estágio de build
COPY --from=builder /usr/src/app/node_modules ./node_modules
# Copia a aplicação compilada do estágio de build
COPY --from=builder /usr/src/app/dist ./dist

# Expõe a porta que a aplicação NestJS usa
EXPOSE 3000

# O comando para iniciar a aplicação
CMD ["node", "dist/main"]