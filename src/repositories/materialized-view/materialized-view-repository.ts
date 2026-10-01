import { MaterializedView } from '../../types/materialized-view';

export abstract class MaterializedViewRepository {
  abstract getSalesSumary(): Promise<MaterializedView[]>;
  abstract refreshView(summaryData: MaterializedView[]): Promise<void>;
}
