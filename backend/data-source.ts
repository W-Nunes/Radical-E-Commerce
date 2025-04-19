// radical/backend/data-source.ts
import 'reflect-metadata'; // Necessário para TypeORM
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv'; // Para carregar variáveis do .env

config(); // Carrega variáveis do .env na raiz do projeto

// Importar TODAS as suas entidades
import { UserEntity } from './src/database/entities/user.entity';
import { ProdutoEntity } from './src/database/entities/produto.entity';
import { CategoriaEntity } from './src/database/entities/categoria.entity';
import { PedidoEntity } from './src/database/entities/pedidos.entity';
import { ItemPedidoEntity } from './src/database/entities/item-pedido.entity';
import { Carrinho } from './src/database/entities/carrinho.entity';
import { ItemCarrinho } from './src/database/entities/item-carrinho.entity';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: { rejectUnauthorized: false }, // Manter a configuração de SSL que funcionou
    synchronize: false, // MUITO IMPORTANTE: Mantenha false!
    logging: true, // Bom para ver o SQL gerado/executado pelas migrations
    entities: [
        // Listar as entidades aqui explicitamente
        UserEntity, ProdutoEntity, CategoriaEntity, PedidoEntity, ItemPedidoEntity, Carrinho, ItemCarrinho
        // Ou usar um padrão de glob (ajuste se necessário):
        // __dirname + '/src/**/*.entity.{js,ts}' // Cuidado com caminhos relativos em config fora de src
        // 'src/**/*.entity.{js,ts}' // Mais seguro se rodar da raiz
    ],
    migrations: [
        // Caminho para onde as migrations serão geradas e lidas
         'src/database/migrations/*.{js,ts}' // Padrão comum
    ],
    // Você pode precisar adicionar estas opções dependendo da sua config TS/JS
    // migrationsTableName: 'typeorm_migrations', // Nome da tabela que o TypeORM usa para controlar migrations
    // metadataTableName: 'typeorm_metadata', // Nome da tabela de metadados (menos comum precisar)
};

// Exportar a instância do DataSource para a CLI usar
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;