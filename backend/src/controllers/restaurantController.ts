import { Response, NextFunction } from 'express';
import { RestaurantService } from '../services/restaurantService';
import { AuthRequest } from '../middleware/auth';

export class RestaurantController {
  static async createRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, cuisine, imageUrl } = req.body;

      const restaurant = await RestaurantService.createRestaurant(name, cuisine, imageUrl);

      res.status(201).json({
        success: true,
        data: { restaurant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const restaurant = await RestaurantService.getRestaurant(id);

      res.status(200).json({
        success: true,
        data: { restaurant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllRestaurants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const activeOnly = req.query.active === 'true';

      const restaurants = await RestaurantService.getAllRestaurants(activeOnly);

      res.status(200).json({
        success: true,
        data: { restaurants, count: restaurants.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const restaurant = await RestaurantService.updateRestaurant(id, updates);

      res.status(200).json({
        success: true,
        data: { restaurant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await RestaurantService.deleteRestaurant(id);

      res.status(200).json({
        success: true,
        data: { message: 'Restaurant deleted successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleRestaurantStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const restaurant = await RestaurantService.toggleRestaurantStatus(id);

      res.status(200).json({
        success: true,
        data: { restaurant },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
