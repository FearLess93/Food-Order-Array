import { Response, NextFunction } from 'express';
import { talabatService } from '../services/talabatService';
import { OrderService } from '../services/orderService';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

export class TalabatController {
  static async getRestaurants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!talabatService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TALABAT_NOT_CONFIGURED',
            message: 'Talabat integration is not configured',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { city, cuisine, latitude, longitude } = req.query;

      const restaurants = await talabatService.getRestaurants({
        city: city as string,
        cuisine: cuisine as string,
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
      });

      res.status(200).json({
        success: true,
        data: { restaurants, count: restaurants.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getRestaurantMenu(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!talabatService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TALABAT_NOT_CONFIGURED',
            message: 'Talabat integration is not configured',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { restaurantId } = req.params;

      const menu = await talabatService.getRestaurantMenu(restaurantId);

      res.status(200).json({
        success: true,
        data: { menu, count: menu.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncRestaurant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!talabatService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TALABAT_NOT_CONFIGURED',
            message: 'Talabat integration is not configured',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { talabatRestaurantId } = req.body;

      if (!talabatRestaurantId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Talabat restaurant ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await talabatService.syncRestaurant(talabatRestaurantId);

      res.status(201).json({
        success: true,
        data: {
          restaurant: result.restaurant,
          menuItemsCount: result.menuItems.length,
          message: 'Restaurant synced successfully from Talabat',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async placeGroupOrder(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!talabatService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TALABAT_NOT_CONFIGURED',
            message: 'Talabat integration is not configured',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { date, paymentMethod } = req.body;
      const targetDate = date ? new Date(date) : new Date();

      // Get group order from our system
      const groupOrder = await OrderService.getGroupOrder(targetDate);

      if (groupOrder.orders.length === 0) {
        throw new CustomError('No orders to place', 400, 'NO_ORDERS');
      }

      // Get restaurant's Talabat ID (you'll need to store this when syncing)
      // For now, we'll assume it's passed in the request
      const { talabatRestaurantId } = req.body;
      
      if (!talabatRestaurantId) {
        throw new CustomError('Talabat restaurant ID is required', 400, 'MISSING_TALABAT_ID');
      }

      // Prepare orders for Talabat
      const ordersForTalabat = groupOrder.orders.map(order => ({
        employeeName: order.user.name,
        items: order.items.map(item => ({
          talabatItemId: item.menuItem.id, // This should be the Talabat item ID
          quantity: item.quantity,
          notes: item.notes,
        })),
      }));

      // Use company address from config
      const deliveryAddress = {
        street: config.companyAddress.street,
        building: config.companyAddress.building,
        floor: config.companyAddress.floor,
        city: config.companyAddress.city,
        area: config.companyAddress.area,
      };

      // Place order through Talabat
      const talabatOrder = await talabatService.placeGroupOrder({
        restaurantId: groupOrder.restaurant.id,
        talabatRestaurantId,
        orders: ordersForTalabat,
        deliveryAddress,
        contactPhone: config.companyAddress.phone,
        paymentMethod: paymentMethod || 'cash',
      });

      res.status(201).json({
        success: true,
        data: {
          talabatOrderId: talabatOrder.orderId,
          status: talabatOrder.status,
          estimatedDeliveryTime: talabatOrder.estimatedDeliveryTime,
          totalAmount: talabatOrder.totalAmount,
          trackingUrl: talabatOrder.trackingUrl,
          message: 'Group order placed successfully through Talabat',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getOrderStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!talabatService.isConfigured()) {
        res.status(503).json({
          success: false,
          error: {
            code: 'TALABAT_NOT_CONFIGURED',
            message: 'Talabat integration is not configured',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { orderId } = req.params;

      const status = await talabatService.getOrderStatus(orderId);

      res.status(200).json({
        success: true,
        data: status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getIntegrationStatus(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const isConfigured = talabatService.isConfigured();
      const isEnabled = config.talabat.enabled;

      res.status(200).json({
        success: true,
        data: {
          configured: isConfigured,
          enabled: isEnabled,
          status: isConfigured && isEnabled ? 'active' : 'inactive',
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
