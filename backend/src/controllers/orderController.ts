import { Response, NextFunction } from 'express';
import { OrderService } from '../services/orderService';
import { AuthRequest } from '../middleware/auth';

export class OrderController {
  static async createOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { restaurantId, items } = req.body;
      const dateStr = req.body.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      if (!restaurantId || !items) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Restaurant ID and items are required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const order = await OrderService.createOrder(req.user.userId, restaurantId, items, date);

      res.status(201).json({
        success: true,
        data: { order },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const order = await OrderService.getOrder(id, userId);

      res.status(200).json({
        success: true,
        data: { order },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const orders = await OrderService.getUserOrders(req.user.userId);

      res.status(200).json({
        success: true,
        data: { orders, count: orders.length },
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

      const groupOrder = await OrderService.getGroupOrder(date);

      res.status(200).json({
        success: true,
        data: groupOrder,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async cancelOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { id } = req.params;

      const order = await OrderService.cancelOrder(id, req.user.userId);

      res.status(200).json({
        success: true,
        data: { order, message: 'Order cancelled successfully' },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async exportOrders(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;
      const format = (req.query.format as 'text' | 'csv' | 'json') || 'text';

      const exportData = await OrderService.exportOrders(date, format);

      // Set appropriate content type and filename
      const dateString = (date || new Date()).toISOString().split('T')[0];
      let contentType = 'text/plain';
      let extension = 'txt';

      if (format === 'csv') {
        contentType = 'text/csv';
        extension = 'csv';
      } else if (format === 'json') {
        contentType = 'application/json';
        extension = 'json';
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="orders-${dateString}.${extension}"`);
      res.status(200).send(exportData);
    } catch (error) {
      next(error);
    }
  }
}
