import { Router } from 'express';
import { RestaurantController, getMenuValidation } from '../controllers/restaurantController';

const router = Router();

// Public routes - no authentication required for browsing
router.get('/', RestaurantController.getAllRestaurants);
router.get('/:id', RestaurantController.getRestaurantById);
router.get('/:id/menu', getMenuValidation, RestaurantController.getRestaurantMenu);

export default router;
