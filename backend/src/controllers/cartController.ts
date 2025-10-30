import { Response, NextFunction } from 'express';
import { CartService } from '../services/cartService';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export class CartController {
  /**
   * Get cart for a group
   * GET /api/groups/:groupId/cart
   */
  static async getGroupCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { groupId } = req.params;

      const cartSummary = await CartService.getGroupCart(groupId, userId);

      res.status(200).json({
        success: true,
        data: cartSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add item to cart
   * POST /api/groups/:groupId/cart
   */
  static async addToCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { groupId } = req.params;
      const { menuItemId, quantity } = req.body;

      const cart = await CartService.addToCart({
        groupId,
        userId,
        menuItemId,
        quantity,
      });

      res.status(201).json({
        success: true,
        data: { cart },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove item from cart
   * DELETE /api/cart-items/:id
   */
  static async removeFromCart(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;

      await CartService.removeFromCart(id, userId);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update cart item quantity
   * PATCH /api/cart-items/:id
   */
  static async updateQuantity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const { quantity } = req.body;

      await CartService.updateQuantity(id, userId, quantity);

      res.status(200).json({
        success: true,
        message: 'Quantity updated',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
export const addToCartValidation = [
  body('menuItemId').isUUID().withMessage('Valid menu item ID is required'),
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
];

export const updateQuantityValidation = [
  body('quantity').isInt({ min: 1, max: 99 }).withMessage('Quantity must be between 1 and 99'),
];
