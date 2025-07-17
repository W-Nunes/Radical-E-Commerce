import 'reflect-metadata'; 
import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

config(); // Carrega variáveis do .env na raiz do projeto

// Entidades
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
    ssl: { rejectUnauthorized: false },
    synchronize: false,
    logging: true, // Pra ver o SQL gerado/executado pelas migrations
    entities: [
        UserEntity, ProdutoEntity, CategoriaEntity, PedidoEntity, ItemPedidoEntity, Carrinho, ItemCarrinho
    ],
    migrations: [
        // Caminho para onde as migrations serão geradas e lidas
         'src/database/migrations/*.{js,ts}' // Padrão comum
    ],
};

// Exporta a instância do DataSource para a CLI usar
const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;