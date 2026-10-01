import database from '../../config/database';
import { MaterializedView } from '../../types/materialized-view';
import { MaterializedViewRepository } from './materialized-view-repository';

interface UserOrderDbRow {
  produto_id: string;
  produto_nome: string;
  total_pedidos: number;
  qtd_total_vendida: number;
  total_receita: number;
  atualizado_em: Date;
}

export class PgMaterializedViewRepository extends MaterializedViewRepository {
  async getSalesSumary(): Promise<MaterializedView[]> {
    const query = `SELECT * FROM mv_resumo_vendas_produtos`;

    const { rows } = await database.query<UserOrderDbRow>(query);

    return rows.map((row) => ({
      id: row.produto_id,
      nome: row.produto_nome,
      totalPedidos: row.total_pedidos,
      qtdTotalVendida: row.qtd_total_vendida,
      totalReceita: row.total_receita,
      atualizadoEm: row.atualizado_em,
    }));
  }

  async refreshView(summaryData: MaterializedView[]): Promise<void> {
    const client = await database.getClient();
    try {
      await client.query('BEGIN');

      // Limpa os dados antigos
      await client.query('TRUNCATE TABLE mv_resumo_vendas_produtos');

      // Insere os novos dados pré-calculados
      for (const item of summaryData) {
        await client.query(
          `INSERT INTO mv_resumo_vendas_produtos 
           (produto_id, produto_nome, total_pedidos, qtd_total_vendida, receita_total, atualizado_em) 
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [item.id, item.nome, item.totalPedidos, item.qtdTotalVendida, item.totalReceita],
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
