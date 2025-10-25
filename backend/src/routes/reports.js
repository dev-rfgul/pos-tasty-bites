import express from 'express';
import { salesReport } from '../controllers/reportController.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(requireTenant);
router.get('/sales', salesReport);

export default router;
