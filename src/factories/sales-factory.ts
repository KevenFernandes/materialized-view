import { LiveSumaryController } from '../controllers/live-sumary-controller';
import { MaterializedViewController } from '../controllers/materialized-view-controller';
import { MaterializedViewJob } from '../jobs/materialized-view-job';
import { PgMaterializedViewRepository } from '../repositories/materialized-view/pg-materialized-view-repository';
import { PgOrderRepository } from '../repositories/order/pg-order-repository';
import { SalesReportService } from '../services/sales-report-service';

export class SalesFactory {
  private static orderRepository = new PgOrderRepository();
  private static materializedViewRepository = new PgMaterializedViewRepository();
  private static salesReportService = new SalesReportService(
    SalesFactory.orderRepository,
    SalesFactory.materializedViewRepository,
  );

  static makeMaterializedViewController(): MaterializedViewController {
    return new MaterializedViewController(this.salesReportService);
  }

  static makeLiveSumaryController(): LiveSumaryController {
    return new LiveSumaryController(this.salesReportService);
  }

  static makeJob(): MaterializedViewJob {
    return new MaterializedViewJob(this.orderRepository, this.materializedViewRepository);
  }
}
