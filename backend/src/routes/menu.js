import express from 'express';
import { listMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menuController.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(requireTenant);
router.get('/', listMenu);
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
