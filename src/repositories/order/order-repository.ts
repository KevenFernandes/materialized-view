import { Order } from '../../types/order';

export abstract class OrderRepository {
  abstract getAggregatedSales(): Promise<Order[]>;
}
