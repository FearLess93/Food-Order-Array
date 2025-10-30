import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Statistics and overview
router.get('/stats/daily', AdminController.getDailyStats);
router.get('/stats/overview', AdminController.getSystemOverview);

// Voting management
router.get('/voting/results', AdminController.getVotingResults);

// Order management
router.get('/orders/group', AdminController.getGroupOrder);

// Restaurant availability management
router.post('/restaurants/daily', AdminController.setDailyRestaurants);
router.get('/restaurants/daily', AdminController.getDailyRestaurants);

// User management
router.get('/users', AdminController.getAllUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);

export default router;
