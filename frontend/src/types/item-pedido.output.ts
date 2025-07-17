export interface ItemPedidoType {
    __typename?: 'ItemPedidoType';
    id: string; // ID do ItemPedido (UUID/string)
    produtoId: string | null; // ID do Produto (UUID/string),
    nomeProduto: string | null;
    skuProduto: string | null; 
    quantidade: number;
    precoUnitarioCompra: number;
}