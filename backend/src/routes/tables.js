import express from 'express';
import { listTables, createTable, updateTable } from '../controllers/tableController.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(requireTenant);
router.get('/', listTables);
router.post('/', createTable);
router.put('/:id', updateTable);

export default router;
