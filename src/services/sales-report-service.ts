import { MaterializedViewRepository } from '../repositories/materialized-view/materialized-view-repository';
import { OrderRepository } from '../repositories/order/order-repository';

export class SalesReportService {
  private readonly orderRepository: OrderRepository;
  private readonly materializedViewRepository: MaterializedViewRepository;

  constructor(
    orderRepository: OrderRepository,
    materializedViewRepository: MaterializedViewRepository,
  ) {
    this.orderRepository = orderRepository;
    this.materializedViewRepository = materializedViewRepository;
  }

  async refreshSalesReport(): Promise<void> {
    const rawSales = await this.orderRepository.getAggregatedSales();

    await this.materializedViewRepository.refreshView(rawSales);
  }

  async getMaterializedSalesReport() {
    const view = await this.materializedViewRepository.getSalesSumary();
    return view;
  }

  async getLiveSalesReport() {
    const rawData = await this.orderRepository.getAggregatedSales();
    return rawData;
  }
}
