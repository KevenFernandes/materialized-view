import { MaterializedViewRepository } from '../repositories/materialized-view/materialized-view-repository';
import { OrderRepository } from '../repositories/order/order-repository';

export class MaterializedViewJob {
  private timer: NodeJS.Timeout | null = null;
  private readonly orderRepository: OrderRepository;
  private readonly materializedViewRepository: MaterializedViewRepository;
  private readonly intervalMs: number;

  constructor(
    orderRepository: OrderRepository,
    materializedViewRepository: MaterializedViewRepository,
    intervalMs: number = 60000, // 1 minuto por padrão
  ) {
    this.materializedViewRepository = materializedViewRepository;
    this.orderRepository = orderRepository;
    this.intervalMs = intervalMs;
  }

  // Inicia o agendamento
  public start(): void {
    if (this.timer) {
      console.warn('[JOB] O job já está em execução.');
      return;
    }

    console.log(`[JOB] Job iniciado com intervalo de ${this.intervalMs}ms.`);

    // Executa imediatamente na primeira vez (opcional, mas muito prático)
    this.run();

    // agenda as próximas execuções
    this.timer = setInterval(() => this.run(), this.intervalMs);
  }

  // Interrompe o agendamento (útil para testes ou shutdown gracioso do servidor)
  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[JOB] Job parado com sucesso.');
    }
  }

  // Método responsável pela tarefa em si (pode ser private)
  private async run(): Promise<void> {
    console.log('[JOB] Atualizando visão materializada de vendas...');
    try {
      // Busca a consulta agregada
      const aggregatedData = await this.orderRepository.getAggregatedSales();

      // Atualiza a tabela da visão materializada
      await this.materializedViewRepository.refreshView(aggregatedData);

      console.log('[JOB] Visão materializada atualizada com sucesso!');
    } catch (error: any) {
      console.error('[JOB ERROR] Falha ao atualizar visão:', error?.message || error);
    }
  }
}
