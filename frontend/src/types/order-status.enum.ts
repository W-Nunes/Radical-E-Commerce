// Define os status possíveis de um pedido espelhando o backend
export enum OrderStatus {
    PENDING = 'PENDENTE',
    PROCESSING = 'PROCESSANDO',
    PAID = 'PAGO',
    SHIPPED = 'ENVIADO',
    DELIVERED = 'ENTREGUE',
    CANCELED = 'CANCELADO',
    FAILED = 'FALHOU',
}