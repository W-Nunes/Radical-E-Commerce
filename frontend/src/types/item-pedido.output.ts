// Define a estrutura de um item DENTRO de um pedido, como vem da API
export interface ItemPedidoType {
    __typename?: 'ItemPedidoType';
    id: string; // ID do ItemPedido (UUID/string)
    produtoId: string | null; // ID do Produto (UUID/string), pode ser null
    nomeProduto: string | null; // Nome no momento da compra
    skuProduto: string | null; // SKU no momento da compra
    quantidade: number;
    precoUnitarioCompra: number;
}