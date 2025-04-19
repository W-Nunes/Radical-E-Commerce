import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1745016752864 implements MigrationInterface {
    name = ' $npmConfigName1745016752864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "itens_pedido" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "pedido_id" uuid NOT NULL, "produto_id" uuid, "nome_produto" character varying(150), "sku_produto" character varying(100), "quantidade" integer NOT NULL, "preco_unitario_compra" numeric(10,2) NOT NULL, CONSTRAINT "PK_34ba752329a604381e367c431ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pedidos_status_enum" AS ENUM('PENDENTE', 'PROCESSANDO', 'PAGO', 'ENVIADO', 'ENTREGUE', 'CANCELADO', 'FALHOU')`);
        await queryRunner.query(`CREATE TABLE "pedidos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "valor_total" numeric(10,2) NOT NULL, "status" "public"."pedidos_status_enum" NOT NULL DEFAULT 'PENDENTE', "endereco_entrega" jsonb, "endereco_faturamento" jsonb, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_ebb5680ed29a24efdc586846725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "itens_carrinho" ("id" SERIAL NOT NULL, "carrinho_id" uuid NOT NULL, "produto_id" character varying NOT NULL, "quantidade" integer NOT NULL, "preco_unitario_registrado" numeric(10,2) NOT NULL, "adicionado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e7626bde24b1876f4c7268cdcea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "carrinhos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "usuario_id" uuid NOT NULL, "criado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "atualizado_em" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8ed80828de93327d4601c21c30f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" ADD CONSTRAINT "FK_4857bab44b0ffd40ac76c2d89c8" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" ADD CONSTRAINT "FK_62858ad64cfe45434e204e01fe6" FOREIGN KEY ("produto_id") REFERENCES "produtos"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "pedidos" ADD CONSTRAINT "FK_44db92bd8242455d454c1d2c5d9" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "itens_carrinho" ADD CONSTRAINT "FK_a9b555ead5bb5f086d34bd9b8f3" FOREIGN KEY ("carrinho_id") REFERENCES "carrinhos"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "carrinhos" ADD CONSTRAINT "FK_9cf07b18e658cbd538ee3c5fe37" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carrinhos" DROP CONSTRAINT "FK_9cf07b18e658cbd538ee3c5fe37"`);
        await queryRunner.query(`ALTER TABLE "itens_carrinho" DROP CONSTRAINT "FK_a9b555ead5bb5f086d34bd9b8f3"`);
        await queryRunner.query(`ALTER TABLE "pedidos" DROP CONSTRAINT "FK_44db92bd8242455d454c1d2c5d9"`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" DROP CONSTRAINT "FK_62858ad64cfe45434e204e01fe6"`);
        await queryRunner.query(`ALTER TABLE "itens_pedido" DROP CONSTRAINT "FK_4857bab44b0ffd40ac76c2d89c8"`);
        await queryRunner.query(`DROP TABLE "carrinhos"`);
        await queryRunner.query(`DROP TABLE "itens_carrinho"`);
        await queryRunner.query(`DROP TABLE "pedidos"`);
        await queryRunner.query(`DROP TYPE "public"."pedidos_status_enum"`);
        await queryRunner.query(`DROP TABLE "itens_pedido"`);
    }

}
