import { Router } from 'express';
import { TalabatController } from '../controllers/talabatController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (authenticated users)
router.get('/status', authenticate, TalabatController.getIntegrationStatus);

// Admin only routes
router.get('/restaurants', authenticate, requireAdmin, TalabatController.getRestaurants);
router.get('/restaurants/:restaurantId/menu', authenticate, requireAdmin, TalabatController.getRestaurantMenu);
router.post('/restaurants/sync', authenticate, requireAdmin, TalabatController.syncRestaurant);
router.post('/orders/place-group', authenticate, requireAdmin, TalabatController.placeGroupOrder);
router.get('/orders/:orderId/status', authenticate, requireAdmin, TalabatController.getOrderStatus);

export default router;
