import { Request, Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurantService';
import { query, validationResult } from 'express-validator';

export class RestaurantController {
  /**
   * Get all restaurants
   * GET /api/restaurants
   */
  static async getAllRestaurants(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const restaurants = await RestaurantService.getAllRestaurants();

      res.status(200).json({
        success: true,
        data: {
          restaurants,
          count: restaurants.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get restaurant by ID
   * GET /api/restaurants/:id
   */
  static async getRestaurantById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;

      const restaurant = await RestaurantService.getRestaurantById(id);

      res.status(200).json({
        success: true,
        data: { restaurant },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get restaurant menu
   * GET /api/restaurants/:id/menu
   */
  static async getRestaurantMenu(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      const { id } = req.params;
      const { search, tags } = req.query;

      const filters = {
        search: search as string | undefined,
        tags: tags ? (tags as string).split(',') : undefined,
      };

      const menuItems = await RestaurantService.getRestaurantMenu(id, filters);

      res.status(200).json({
        success: true,
        data: {
          menuItems,
          count: menuItems.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
export const getMenuValidation = [
  query('search').optional().isString().trim(),
  query('tags').optional().isString(),
];
