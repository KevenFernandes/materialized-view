import database from '../../config/database';
import { Order } from '../../types/order';
import { OrderRepository } from './order-repository';

interface OrderDbRow {
  produto_id: string;
  produto_nome: string;
  total_pedidos: number;
  qtd_total_vendida: number;
  receita_total: number;
}

export class PgOrderRepository implements OrderRepository {
  async getAggregatedSales(): Promise<Order[]> {
    const query = `
      SELECT 
        p.id AS produto_id,
        p.nome AS produto_nome,
        COUNT(DISTINCT ped.id) AS total_pedidos,
        SUM(ip.quantidade) AS qtd_total_vendida,
        SUM(ip.quantidade * ip.preco_unitario) AS receita_total
      FROM itens_pedido ip
      INNER JOIN pedidos ped ON ped.id = ip.pedido_id
      INNER JOIN produtos p ON p.id = ip.produto_id
      WHERE ped.status = 'concluido'
      GROUP BY p.id, p.nome;
    `;

    const { rows } = await database.query<OrderDbRow>(query);

    return rows.map((row) => ({
      id: row.produto_id,
      nome: row.produto_nome,
      totalPedidos: Number(row.total_pedidos),
      qtdTotalVendida: Number(row.qtd_total_vendida),
      totalReceita: Number(row.receita_total),
    }));
  }
}
