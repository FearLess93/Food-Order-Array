import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Authenticated user routes
router.post('/', authenticate, OrderController.createOrder);
router.get('/my-orders', authenticate, OrderController.getUserOrders);
router.get('/group', authenticate, OrderController.getGroupOrder);
router.get('/:id', authenticate, OrderController.getOrder);
router.delete('/:id', authenticate, OrderController.cancelOrder);

// Admin only routes
router.get('/export/download', authenticate, requireAdmin, OrderController.exportOrders);

export default router;
