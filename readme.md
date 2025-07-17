<div align="center">
  <img src="https://i.imgur.com/83p0I3g.png" alt="Capa do Projeto Radical E-commerce" width="800"/>
  <h1>Radical E-commerce: Portfólio Full Stack</h1>
  <p>
    <strong>Uma plataforma de e-commerce completa, construída com uma arquitetura moderna e escalável para demonstrar competências de ponta em desenvolvimento de software.</strong>
  </p>
  <p>
    <a href="#-arquitetura-do-sistema">Arquitetura</a> •
    <a href="#-tecnologias-utilizadas">Tecnologias</a> •
    <a href="#-como-executar-o-projeto">Como Executar</a> •
    <a href="#-testes">Testes</a> •
    <a href="#-banco-de-dados">Banco de Dados</a>
  </p>
</div>

## 📖 Visão Geral do Projeto
**Radical E-commerce** é um projeto full-stack de uma loja virtual moderna e responsiva, focada no universo do skate e BMX. Desenvolvido para servir como um portfólio técnico, este projeto demonstra a aplicação de tecnologias de ponta, boas práticas de desenvolvimento, testes automatizados e integração contínua, refletindo as habilidades de um desenvolvedor sênior.

O sistema é construído sobre uma arquitetura modular, com um frontend dinâmico em **Vue.js 3**, um backend robusto em **NestJS** servindo uma API **GraphQL**, e um banco de dados **PostgreSQL** gerenciado pelo ORM **TypeORM**.

## ✨ Funcionalidades Implementadas
- **Catálogo de Produtos:** Visualização de produtos com paginação, ordenação e filtros por categoria.
- **Busca de Produtos:** Funcionalidade de pesquisa por nome e descrição.
- **Autenticação de Usuários:** Sistema completo de registro e login com **JSON Web Tokens (JWT)**.
- **Carrinho de Compras Persistente:** Adicione, remova, atualize a quantidade de itens e visualize o carrinho, que é atrelado ao usuário.
- **Painel Administrativo Simples:** Área para criar e editar produtos, com rotas protegidas.
- **Fluxo de Checkout:**
  - Cálculo de frete (simulado).
  - Formulário para endereço de entrega.
  - Criação de pedido com os itens do carrinho.
  - Simulação de processamento de pagamento.
  - Limpeza do carrinho após a compra.
- **Página de Confirmação de Pedido:** Exibe os detalhes do pedido recém-criado.
- **Páginas Promocionais:** Landing pages de vídeo e sliders para campanhas de marketing.
- **Design Responsivo:** Interface totalmente adaptável para desktops e celulares, desenvolvida com **Tailwind CSS**.

## 🏗️ Arquitetura do Sistema
A arquitetura foi planejada para ser escalável e modular. Embora desenvolvida como uma aplicação monolítica, a estrutura do backend em **módulos desacoplados** (Auth, Produtos, Pedidos, Pagamentos) simula uma abordagem de microserviços, facilitando a manutenção e a futura migração para serviços independentes.

![Diagrama de Arquitetura](https://i.imgur.com/L4g2G0z.png)

1.  **Frontend (Vue.js):** A camada de apresentação, responsável pela interface do usuário. Consome a API GraphQL do Backend.
2.  **Backend (NestJS API):** O núcleo do sistema, expondo uma única API GraphQL que serve como um *Gateway* para os módulos de negócio.
3.  **Database (PostgreSQL):** O banco de dados relacional que armazena todos os dados da aplicação.

### Expansões Futuras
- **Mensageria Assíncrona:** Integrar **RabbitMQ** ou **Kafka** para comunicação entre serviços (ex: notificar um serviço de e-mails quando um pedido for criado).
- **Deploy em Nuvem com Orquestração:** Realizar o deploy dos containers Docker em um cluster **Kubernetes** (AKS ou EKS) na **Azure** ou **AWS**.

## 🚀 Tecnologias Utilizadas

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Backend** | **Node.js, NestJS, TypeScript** | Framework robusto e escalável para a construção da API. |
| | **GraphQL (Apollo Server)** | Linguagem de consulta para APIs, otimizando a comunicação com o frontend. |
| | **TypeORM** | ORM para mapeamento objeto-relacional com o banco de dados. |
| | **Passport.js (JWT)** | Estratégia de autenticação e autorização baseada em tokens. |
| **Frontend** | **Vue.js 3, TypeScript** | Framework progressivo com Composition API para interfaces reativas. |
| | **Vite** | Ferramenta de build extremamente rápida para desenvolvimento moderno. |
| | **Pinia** | Gerenciador de estado oficial e intuitivo para Vue.js. |
| | **Tailwind CSS** | Framework CSS utility-first para estilização rápida e responsiva. |
| | **Apollo Client** | Cliente GraphQL completo para gerenciamento de dados e cache no frontend. |
| **Banco de Dados**| **PostgreSQL** | Banco de dados relacional open-source robusto e confiável. |
| **DevOps** | **Docker & Docker Compose** | Containerização da aplicação para um ambiente de desenvolvimento consistente. |
| | **GitHub Actions** | Automação de CI/CD para execução de testes a cada push. |
| **Testes** | **Jest & Supertest** | Frameworks de testes para garantir a qualidade do backend (unitários e e2e). |

## 🗄️ Banco de Dados
O sistema utiliza **PostgreSQL**. O **TypeORM** gerencia o mapeamento das entidades e as relações do banco. O seeding de dados iniciais (categorias e produtos) é feito automaticamente na inicialização do servidor.

### Estrutura das Tabelas (Entidades TypeORM)
- **`UserEntity`**: Armazena dados de usuários, incluindo nome, email e hash da senha.
- **`CategoriaEntity`**: Define as categorias dos produtos (Shapes, Rodas, etc.).
- **`ProdutoEntity`**: Contém os detalhes dos produtos, com uma relação `ManyToOne` com `CategoriaEntity`.
- **`Carrinho` e `ItemCarrinho`**: Gerenciam o estado do carrinho de compras para cada usuário.
- **`PedidoEntity` e `ItemPedidoEntity`**: Armazenam o histórico de compras, com os detalhes dos produtos e endereço no momento da compra.

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/en/) (v20 ou superior)
- [Docker](https://www.docker.com/get-started/) e Docker Compose

### 1. Clonar o Repositório
```bash
git clone [https://github.com/W-Nunes/Radical-E-Commerce.git](https://github.com/W-Nunes/Radical-E-Commerce.git)
cd Radical-E-Commerce
```

### 2. Configurar e Iniciar o Backend
```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install
```
O projeto está configurado para rodar com o Docker. O arquivo `.env.development` já contém as variáveis de ambiente necessárias para a conexão com o banco de dados.

```bash
# Suba os containers do backend e do banco de dados
docker-compose up --build -d
```
O servidor NestJS (com o seeder de dados) iniciará automaticamente.

### 3. Configurar e Rodar o Frontend
```bash
# Em um novo terminal, navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento do Vite
npm run dev
```
A aplicação estará acessível em `http://localhost:5173`.

## 🧪 Estratégia de Testes
O projeto possui uma suíte de testes robusta para garantir a qualidade do código no backend.

-   **Testes Unitários:** Focam em testar a lógica de negócio isolada dentro dos `services` (`produtos.service.spec.ts`).
-   **Testes de Integração (E2E):** Validam o fluxo completo de uma requisição GraphQL, desde o resolver até o banco de dados, utilizando um banco de testes separado e limpo a cada execução (`produtos.e2e-spec.ts`).

**Para executar todos os testes do backend:**
```bash
# Na pasta /backend
npm test

# Para rodar apenas os testes E2E
npm run test:e2e
```

## 🔄 Integração Contínua (CI)
O workflow de CI, configurado em `.github/workflows/ci.yml`, é acionado a cada `push` ou `pull request`. Ele automatiza a execução de todos os testes do backend em um ambiente limpo com Docker, garantindo que novas funcionalidades ou correções não introduzam regressões.

## ✍️ Autor
Desenvolvido com dedicação por **Renan Wesler Nunes**.

-   **GitHub:** [@W-Nunes](https://github.com/W-Nunes)
-   **LinkedIn:** [Renan Wesler Nunes](https://www.linkedin.com/in/renan-wesler-nunes-06a89a325/)
-   **Email:** [renanwn96@gmail.com](mailto:renanwn96@gmail.com)