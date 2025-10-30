import { Router } from 'express';
import { MenuController } from '../controllers/menuController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (authenticated users)
router.get('/restaurant/:restaurantId', authenticate, MenuController.getRestaurantMenu);
router.get('/:id', authenticate, MenuController.getMenuItem);

// Admin only routes
router.post('/restaurant/:restaurantId', authenticate, requireAdmin, MenuController.createMenuItem);
router.post('/restaurant/:restaurantId/bulk', authenticate, requireAdmin, MenuController.bulkUploadMenu);
router.put('/restaurant/:restaurantId/replace', authenticate, requireAdmin, MenuController.replaceRestaurantMenu);
router.put('/:id', authenticate, requireAdmin, MenuController.updateMenuItem);
router.delete('/:id', authenticate, requireAdmin, MenuController.deleteMenuItem);

export default router;
