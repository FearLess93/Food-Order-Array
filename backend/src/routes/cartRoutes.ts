import { Router } from 'express';
import {
  CartController,
  addToCartValidation,
  updateQuantityValidation,
} from '../controllers/cartController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All cart routes require authentication

// Group cart routes
router.get('/groups/:groupId/cart', authenticate, CartController.getGroupCart);
router.post('/groups/:groupId/cart', authenticate, addToCartValidation, CartController.addToCart);

// Cart item routes
router.delete('/cart-items/:id', authenticate, CartController.removeFromCart);
router.patch('/cart-items/:id', authenticate, updateQuantityValidation, CartController.updateQuantity);

export default router;
