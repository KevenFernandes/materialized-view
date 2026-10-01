import { Router } from 'express';
import { SalesFactory } from './factories/sales-factory';

const router = Router();

const salesMaterializedController = SalesFactory.makeMaterializedViewController();
const salesLiveSummaryController = SalesFactory.makeLiveSumaryController();

router.get('/sales-report/sumary', salesMaterializedController.getAggregatedSales);
router.get('/sales-report/live', salesLiveSummaryController.getLiveSummary);

export default router;
