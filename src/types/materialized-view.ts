import { Order } from './order';

export interface MaterializedView extends Order {
  atualizadoEm?: Date;
}
