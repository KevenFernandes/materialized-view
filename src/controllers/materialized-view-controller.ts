import { Request, Response } from 'express';
import { SalesReportService } from '../services/sales-report-service';

export class MaterializedViewController {
  private readonly salesReportService: SalesReportService;

  constructor(salesReportService: SalesReportService) {
    this.salesReportService = salesReportService;
  }

  public getAggregatedSales = async (req: Request, res: Response): Promise<Response> => {
    try {
      // Busca os dados diretamente da tabela/view rápida já atualizada pelo Job
      const sales = await this.salesReportService.getMaterializedSalesReport();

      return res.status(200).json({
        success: true,
        data: sales,
      });
    } catch (error: any) {
      console.error('[CONTROLLER ERROR] Erro ao buscar resumo de vendas:', error);

      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar dados de vendas.',
      });
    }
  };
}
