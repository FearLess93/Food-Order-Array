import { Router } from 'express';
import { RestaurantController } from '../controllers/restaurantController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (authenticated users)
router.get('/', authenticate, RestaurantController.getAllRestaurants);
router.get('/:id', authenticate, RestaurantController.getRestaurant);

// Admin only routes
router.post('/', authenticate, requireAdmin, RestaurantController.createRestaurant);
router.put('/:id', authenticate, requireAdmin, RestaurantController.updateRestaurant);
router.delete('/:id', authenticate, requireAdmin, RestaurantController.deleteRestaurant);
router.patch('/:id/toggle', authenticate, requireAdmin, RestaurantController.toggleRestaurantStatus);

export default router;
