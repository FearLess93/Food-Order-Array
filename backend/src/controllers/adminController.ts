import { Response, NextFunction } from 'express';
import { AdminService } from '../services/adminService';
import { DailyRestaurantModel } from '../models/DailyRestaurant';
import { AuthRequest } from '../middleware/auth';

export class AdminController {
  static async getDailyStats(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const stats = await AdminService.getDailyStats(date);

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVotingResults(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const results = await AdminService.getVotingResultsDetailed(date);

      res.status(200).json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGroupOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const groupOrder = await AdminService.getGroupOrderDetailed(date);

      res.status(200).json({
        success: true,
        data: groupOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async setDailyRestaurants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { date, restaurantIds } = req.body;

      if (!date || !restaurantIds || !Array.isArray(restaurantIds)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Date and restaurant IDs array are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const targetDate = new Date(date);
      await DailyRestaurantModel.setDailyRestaurants(targetDate, restaurantIds);

      res.status(200).json({
        success: true,
        data: {
          message: 'Daily restaurants set successfully',
          date: targetDate,
          restaurantCount: restaurantIds.length,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDailyRestaurants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      
      if (!dateStr) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Date is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const date = new Date(dateStr);
      const restaurantIds = await DailyRestaurantModel.getDailyRestaurants(date);

      // Get restaurant details
      const { RestaurantModel } = await import('../models/Restaurant');
      const restaurants = await Promise.all(
        restaurantIds.map(id => RestaurantModel.findById(id))
      );

      res.status(200).json({
        success: true,
        data: {
          date,
          restaurants: restaurants.filter(r => r !== null),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllUsers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminService.getAllUsers();

      res.status(200).json({
        success: true,
        data: { users, count: users.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateUserRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['employee', 'admin'].includes(role)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROLE',
            message: 'Role must be either "employee" or "admin"',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const user = await AdminService.updateUserRole(userId, role);

      res.status(200).json({
        success: true,
        data: { user, message: 'User role updated successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSystemOverview(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = await AdminService.getSystemOverview();

      res.status(200).json({
        success: true,
        data: overview,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
