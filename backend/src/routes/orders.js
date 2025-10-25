import express from 'express';
import { createOrder, addOrderItem, checkoutOrder, listOrders } from '../controllers/orderController.js';
import { requireTenant } from '../middleware/tenantMiddleware.js';

const router = express.Router();

router.use(requireTenant);
router.get('/', listOrders);
router.post('/', createOrder);
router.post('/:id/items', addOrderItem);
router.post('/:id/checkout', checkoutOrder);

export default router;
