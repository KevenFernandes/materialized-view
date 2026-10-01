import { type Request, type Response } from 'express';
import { SalesReportService } from '../services/sales-report-service';

export class LiveSumaryController {
  private readonly salesReportService: SalesReportService;

  constructor(salesReportService: SalesReportService) {
    this.salesReportService = salesReportService;
  }

  public getLiveSummary = async (req: Request, res: Response): Promise<Response> => {
    try {
      const sales = await this.salesReportService.getLiveSalesReport();

      return res.status(200).json({
        success: true,
        data: sales,
      });
    } catch (error: any) {
      console.error(
        '[CONTROLLER ERROR] Erro ao buscar dados brutos de vendas sem materializar numa view:',
        error,
      );

      return res.status(500).json({
        success: false,
        message: 'Erro interno ao carregar dados de vendas.',
      });
    }
  };
}
