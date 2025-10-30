import { Response, NextFunction } from 'express';
import { MenuService } from '../services/menuService';
import { AuthRequest } from '../middleware/auth';

export class MenuController {
  static async createMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { name, description, price, category, imageUrl } = req.body;

      const menuItem = await MenuService.createMenuItem(
        restaurantId,
        name,
        description,
        price,
        category,
        imageUrl
      );

      res.status(201).json({
        success: true,
        data: { menuItem },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const menuItem = await MenuService.getMenuItem(id);

      res.status(200).json({
        success: true,
        data: { menuItem },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantMenu(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const availableOnly = req.query.available === 'true';

      const menu = await MenuService.getRestaurantMenu(restaurantId, availableOnly);

      res.status(200).json({
        success: true,
        data: { menu, count: menu.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      const menuItem = await MenuService.updateMenuItem(id, updates);

      res.status(200).json({
        success: true,
        data: { menuItem },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteMenuItem(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      await MenuService.deleteMenuItem(id);

      res.status(200).json({
        success: true,
        data: { message: 'Menu item deleted successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async bulkUploadMenu(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { items } = req.body;

      const menu = await MenuService.bulkUploadMenu(restaurantId, items);

      res.status(201).json({
        success: true,
        data: { menu, count: menu.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async replaceRestaurantMenu(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const { items } = req.body;

      const menu = await MenuService.replaceRestaurantMenu(restaurantId, items);

      res.status(200).json({
        success: true,
        data: { menu, count: menu.length, message: 'Menu replaced successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
