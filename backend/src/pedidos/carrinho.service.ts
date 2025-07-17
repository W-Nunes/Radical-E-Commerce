// radical/backend/src/pedidos/carrinho.service.ts

import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carrinho } from '../database/entities/carrinho.entity';
import { ItemCarrinho } from '../database/entities/item-carrinho.entity';
import { ProdutosService } from '../produtos/produtos.service';
import { UserEntity } from '../database/entities/user.entity';
import { ProdutoEntity } from '../database/entities/produto.entity'; // Importar Produto para type hints

@Injectable()
export class CarrinhoService {
  constructor(
    @InjectRepository(Carrinho)
    private readonly carrinhoRepository: Repository<Carrinho>,
    @InjectRepository(ItemCarrinho)
    private readonly itemCarrinhoRepository: Repository<ItemCarrinho>,
    @Inject(forwardRef(() => ProdutosService))
    private readonly produtosService: ProdutosService,
  ) {}

  // Retorna Promise<Carrinho | null>
  async obterCarrinhoPorUsuario(usuario: UserEntity, relations: string[] = ['itens']): Promise<Carrinho | null> {
    console.log(`Buscando carrinho para usuário ${usuario.id} com relações: ${relations.join(', ')}`);
    const carrinho = await this.carrinhoRepository.findOne({
      where: { usuarioId: usuario.id },
      relations: relations,
    });

    if (carrinho) {
      console.log(`Carrinho ID ${carrinho.id} encontrado com ${carrinho.itens?.length ?? 0} itens.`);
      if (!carrinho.itens) {
          carrinho.itens = [];
      }
    } else {
      console.log(`Nenhum carrinho encontrado para usuário ${usuario.id}. Retornando null.`);
      return null;
    }
    return carrinho;
  }

  // Retorna Promise<Carrinho | null>
  async obterCarrinhoPorUsuarioId(usuarioId: string, relations: string[] = []): Promise<Carrinho | null> {
    return this.carrinhoRepository.findOne({ where: { usuarioId }, relations });
  }

  // Retorna Promise<Carrinho> (Assume que sempre retorna um carrinho válido após add/update)
  async adicionarItemAoCarrinho(carrinho: Carrinho, produtoId: string, quantidade: number): Promise<Carrinho> {
    if (!carrinho || !carrinho.id) {
      throw new InternalServerErrorException('Objeto Carrinho inválido fornecido ao serviço (adicionarItem).');
    }
    if (quantidade <= 0) {
        throw new BadRequestException('A quantidade do item deve ser maior que zero.');
    }

    let produto: ProdutoEntity | null = null; // Explicitamente tipado
    try {
        produto = await this.produtosService.findOne(produtoId);
        if (!produto) {
             throw new NotFoundException(`Produto com ID ${produtoId} não encontrado.`);
        }
    } catch (error) {
         console.error("Erro ao buscar produto em adicionarItemAoCarrinho:", error);
         if (error instanceof NotFoundException) throw error;
         throw new InternalServerErrorException(`Erro ao buscar informações do produto ${produtoId}.`);
    }

    // --- Acesso ao estoque (Erro 1 acontece aqui se 'estoque' não existir na entidade Produto) ---
    const precoAtual = produto.preco; // Preço atual do produto
    const estoqueDisponivel = produto.quantidadeEstoque; // <<<<<<< VERIFIQUE SE 'estoque' EXISTE EM produto.entity.ts
    // -----------------------------------------------------------------------------------------

    if (!carrinho.itens) {
          const carrinhoComItens = await this.carrinhoRepository.findOne({ where: { id: carrinho.id }, relations: ['itens'] });
          if (!carrinhoComItens) throw new InternalServerErrorException(`Falha ao recarregar itens do carrinho ${carrinho.id}`);
          carrinho = carrinhoComItens;
          if (!carrinho.itens) carrinho.itens = [];
     }

    const itemExistenteIndex = carrinho.itens.findIndex(item => item.produtoId === produtoId);
    let quantidadeTotalNoCarrinho = quantidade;

    if (itemExistenteIndex > -1) {
        quantidadeTotalNoCarrinho = carrinho.itens[itemExistenteIndex].quantidade + quantidade;
    }

    if (estoqueDisponivel < quantidadeTotalNoCarrinho) { // <<<<<<< VERIFIQUE SE 'estoque' EXISTE EM produto.entity.ts
       throw new BadRequestException(`Estoque insuficiente para '${produto.nome}'. Disponível: ${estoqueDisponivel}, Tentando adicionar/atualizar para: ${quantidadeTotalNoCarrinho}.`);
    }

    if (itemExistenteIndex > -1) {
      const itemExistente = carrinho.itens[itemExistenteIndex];
      itemExistente.quantidade = quantidadeTotalNoCarrinho;
      itemExistente.precoUnitarioRegistrado = precoAtual;
      await this.itemCarrinhoRepository.save(itemExistente);
      console.log(`Quantidade do item ${produtoId} atualizada para ${itemExistente.quantidade} no carrinho ${carrinho.id}.`);
    } else {
      const novoItem = this.itemCarrinhoRepository.create({
        carrinhoId: carrinho.id,
        produtoId: produtoId,
        quantidade: quantidade,
        precoUnitarioRegistrado: precoAtual,
      });
      await this.itemCarrinhoRepository.save(novoItem);
      console.log(`Novo item ${produtoId} (qtd: ${quantidade}) adicionado ao carrinho ${carrinho.id}.`);
    }

    // Rebusca para garantir consistência e retorna Promise<Carrinho | null>
    const carrinhoAtualizado = await this.obterCarrinhoPorUsuarioId(carrinho.usuarioId, ['itens']);
    if (!carrinhoAtualizado) {
        // Isso não deveria acontecer se o carrinho original era válido, mas por segurança:
        throw new InternalServerErrorException("Falha ao re-buscar carrinho após adicionar item.");
    }
    return carrinhoAtualizado; // Agora garantido como Carrinho
  }


  // --- CORREÇÃO (Erro 2): Mudar tipo de retorno para Promise<Carrinho | null> ---
  async atualizarQuantidadeItem(carrinho: Carrinho, itemCarrinhoId: number, novaQuantidade: number): Promise<Carrinho | null> {
  // -------------------------------------------------------------------------------
    console.log(`Serviço: Atualizando item ${itemCarrinhoId} para quantidade ${novaQuantidade} no carrinho ${carrinho.id}`);

    if (!carrinho || !carrinho.id) {
        throw new InternalServerErrorException('Objeto Carrinho inválido fornecido ao serviço (atualizarQuantidade).');
    }
     if (novaQuantidade <= 0) {
        console.log(`Quantidade ${novaQuantidade} inválida, removendo item ${itemCarrinhoId}.`);
        return this.removerItemDoCarrinho(carrinho, itemCarrinhoId);
     }

    if (!carrinho.itens) {
        const carrinhoComItens = await this.carrinhoRepository.findOne({ where: { id: carrinho.id }, relations: ['itens'] });
        if (!carrinhoComItens) throw new InternalServerErrorException(`Falha ao recarregar itens do carrinho ${carrinho.id}`);
        carrinho = carrinhoComItens;
         if (!carrinho.itens) carrinho.itens = [];
    }

    const itemIndex = carrinho.itens.findIndex(item => item.id === itemCarrinhoId);

    if (itemIndex === -1) {
        throw new NotFoundException(`Item com ID ${itemCarrinhoId} não encontrado no carrinho ${carrinho.id}`);
    }

    const itemParaAtualizar = carrinho.itens[itemIndex];

    let produto: ProdutoEntity | null = null; // Explicitamente tipado
    try {
        produto = await this.produtosService.findOne(itemParaAtualizar.produtoId);
         if (!produto) {
             console.warn(`Produto ${itemParaAtualizar.produtoId} não encontrado. Removendo item ${itemCarrinhoId} do carrinho.`);
             return this.removerItemDoCarrinho(carrinho, itemCarrinhoId); 
         }

         if (produto.quantidadeEstoque < novaQuantidade) { 
            throw new BadRequestException(`Estoque insuficiente para '${produto.nome}'. Disponível: ${produto.quantidadeEstoque}, Tentando atualizar para: ${novaQuantidade}.`);
         }

        itemParaAtualizar.precoUnitarioRegistrado = produto.preco;

    } catch (error) {
        console.error("Erro ao verificar estoque/produto em atualizarQuantidadeItem:", error);
        if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
        throw new InternalServerErrorException(`Erro ao verificar informações do produto ${itemParaAtualizar.produtoId}.`);
    }

    itemParaAtualizar.quantidade = novaQuantidade;
    await this.itemCarrinhoRepository.save(itemParaAtualizar);
    console.log(`Quantidade do item ${itemCarrinhoId} (Prod: ${itemParaAtualizar.produtoId}) atualizada para ${novaQuantidade}.`);

    return this.obterCarrinhoPorUsuarioId(carrinho.usuarioId, ['itens']);
  } 

  async removerItemDoCarrinho(carrinho: Carrinho, itemCarrinhoId: number): Promise<Carrinho | null> {
    if (!carrinho || !carrinho.id) {
      throw new InternalServerErrorException('Objeto Carrinho inválido fornecido ao serviço (removerItem).');
    }

    const resultado = await this.itemCarrinhoRepository.delete({ id: itemCarrinhoId, carrinhoId: carrinho.id });

    if (resultado.affected === 0) {
      throw new NotFoundException(`Item com ID ${itemCarrinhoId} não encontrado neste carrinho.`);
    }
    console.log(`Item ${itemCarrinhoId} removido do carrinho ${carrinho.id}.`);
    return this.obterCarrinhoPorUsuarioId(carrinho.usuarioId, ['itens']);
  } 

  async limparCarrinho(carrinho: Carrinho): Promise<Carrinho | null> {
    if (!carrinho || !carrinho.id) {
      throw new InternalServerErrorException('Objeto Carrinho inválido fornecido ao serviço (limparCarrinho).');
    }
    await this.itemCarrinhoRepository.delete({ carrinhoId: carrinho.id });
    console.log(`Todos os itens removidos do carrinho ${carrinho.id}.`);
    return this.obterCarrinhoPorUsuarioId(carrinho.usuarioId, ['itens']);
  } 

  calcularTotalCarrinho(carrinho: Carrinho): number {
    if (!carrinho || !carrinho.itens) {
      return 0;
    }
    return carrinho.itens.reduce((total, item) => {
      const preco = Number(item.precoUnitarioRegistrado) || 0;
      const quantidade = Number(item.quantidade) || 0;
      return total + (preco * quantidade);
    }, 0);
  } 

} 