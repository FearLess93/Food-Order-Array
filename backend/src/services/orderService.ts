import { OrderModel } from '../models/Order';
import { OrderItemModel } from '../models/OrderItem';
import { MenuItemModel } from '../models/MenuItem';
import { VotingPeriodModel } from '../models/VotingPeriod';
import { UserModel } from '../models/User';
import { Order, OrderItem, MenuItem, User } from '../types';
import { CustomError } from '../middleware/errorHandler';
import pool from '../config/database';

interface OrderItemInput {
  menuItemId: string;
  quantity: number;
  notes?: string;
}

interface OrderWithDetails extends Order {
  items: Array<OrderItem & { menuItem: MenuItem }>;
  user: User;
}

interface GroupOrder {
  date: Date;
  restaurant: {
    id: string;
    name: string;
    cuisine: string;
  };
  orders: OrderWithDetails[];
  totalOrders: number;
  totalAmount: number;
  itemSummary: Array<{
    menuItem: MenuItem;
    totalQuantity: number;
    totalAmount: number;
  }>;
}

export class OrderService {
  static async createOrder(
    userId: string,
    restaurantId: string,
    items: OrderItemInput[],
    date?: Date
  ): Promise<OrderWithDetails> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Validate items array
    if (!items || items.length === 0) {
      throw new CustomError('Order must contain at least one item', 400, 'NO_ITEMS');
    }

    // Get voting period
    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod) {
      throw new CustomError('No voting period found for this date', 404, 'VOTING_PERIOD_NOT_FOUND');
    }

    // Check if voting is complete and winner is determined
    if (!votingPeriod.isComplete || !votingPeriod.winnerRestaurantId) {
      throw new CustomError('Voting must be complete before placing orders', 400, 'VOTING_NOT_COMPLETE');
    }

    // Verify restaurant is the winner
    if (votingPeriod.winnerRestaurantId !== restaurantId) {
      throw new CustomError('Orders can only be placed for the winning restaurant', 400, 'NOT_WINNING_RESTAURANT');
    }

    // Check if user already has an order for this period
    const existingOrder = await OrderModel.findByUserAndPeriod(userId, votingPeriod.id);
    if (existingOrder) {
      throw new CustomError('You have already placed an order for today', 400, 'ORDER_ALREADY_EXISTS');
    }

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Validate menu items and calculate total
      let totalAmount = 0;
      const validatedItems: Array<{ menuItem: MenuItem; quantity: number; notes?: string; subtotal: number }> = [];

      for (const item of items) {
        const menuItem = await MenuItemModel.findById(item.menuItemId);
        
        if (!menuItem) {
          throw new CustomError(`Menu item ${item.menuItemId} not found`, 404, 'MENU_ITEM_NOT_FOUND');
        }

        if (menuItem.restaurantId !== restaurantId) {
          throw new CustomError('All items must be from the same restaurant', 400, 'INVALID_RESTAURANT');
        }

        if (!menuItem.isAvailable) {
          throw new CustomError(`Menu item ${menuItem.name} is not available`, 400, 'ITEM_NOT_AVAILABLE');
        }

        if (item.quantity <= 0) {
          throw new CustomError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
        }

        const subtotal = menuItem.price * item.quantity;
        totalAmount += subtotal;

        validatedItems.push({
          menuItem,
          quantity: item.quantity,
          notes: item.notes,
          subtotal,
        });
      }

      // Create order
      const order = await OrderModel.create(userId, restaurantId, votingPeriod.id, totalAmount);

      // Create order items
      const orderItemsData = validatedItems.map(item => ({
        orderId: order.id,
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes,
        subtotal: item.subtotal,
      }));

      const orderItems = await OrderItemModel.bulkCreate(orderItemsData);

      await client.query('COMMIT');

      // Get user details
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Combine order items with menu item details
      const itemsWithDetails = orderItems.map((orderItem, index) => ({
        ...orderItem,
        menuItem: validatedItems[index].menuItem,
      }));

      return {
        ...order,
        items: itemsWithDetails,
        user,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getOrder(orderId: string, userId?: string): Promise<OrderWithDetails> {
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // If userId provided, verify ownership
    if (userId && order.userId !== userId) {
      throw new CustomError('Unauthorized to view this order', 403, 'UNAUTHORIZED');
    }

    // Get order items
    const orderItems = await OrderItemModel.findByOrder(orderId);

    // Get menu item details for each order item
    const itemsWithDetails = await Promise.all(
      orderItems.map(async (orderItem) => {
        const menuItem = await MenuItemModel.findById(orderItem.menuItemId);
        return {
          ...orderItem,
          menuItem: menuItem!,
        };
      })
    );

    // Get user details
    const user = await UserModel.findById(order.userId);
    if (!user) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      ...order,
      items: itemsWithDetails,
      user,
    };
  }

  static async getUserOrders(userId: string): Promise<Order[]> {
    return await OrderModel.findByUser(userId);
  }

  static async cancelOrder(orderId: string, userId: string): Promise<Order> {
    const order = await OrderModel.findById(orderId);
    
    if (!order) {
      throw new CustomError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      throw new CustomError('Unauthorized to cancel this order', 403, 'UNAUTHORIZED');
    }

    if (order.status === 'cancelled') {
      throw new CustomError('Order is already cancelled', 400, 'ALREADY_CANCELLED');
    }

    if (order.status === 'confirmed') {
      throw new CustomError('Cannot cancel confirmed order', 400, 'CANNOT_CANCEL_CONFIRMED');
    }

    const updated = await OrderModel.updateStatus(orderId, 'cancelled');
    
    if (!updated) {
      throw new CustomError('Failed to cancel order', 500, 'CANCEL_FAILED');
    }

    return updated;
  }

  static async getGroupOrder(date?: Date): Promise<GroupOrder> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get voting period
    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod) {
      throw new CustomError('No voting period found for this date', 404, 'VOTING_PERIOD_NOT_FOUND');
    }

    if (!votingPeriod.isComplete || !votingPeriod.winnerRestaurantId) {
      throw new CustomError('Voting must be complete to view group order', 400, 'VOTING_NOT_COMPLETE');
    }

    // Get all orders for this period
    const orders = await OrderModel.findByVotingPeriod(votingPeriod.id);

    // Get detailed order information
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderItems = await OrderItemModel.findByOrder(order.id);
        const itemsWithDetails = await Promise.all(
          orderItems.map(async (orderItem) => {
            const menuItem = await MenuItemModel.findById(orderItem.menuItemId);
            return {
              ...orderItem,
              menuItem: menuItem!,
            };
          })
        );

        const user = await UserModel.findById(order.userId);
        
        return {
          ...order,
          items: itemsWithDetails,
          user: user!,
        };
      })
    );

    // Calculate totals
    const totalOrders = orders.length;
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Aggregate items
    const itemMap = new Map<string, { menuItem: MenuItem; totalQuantity: number; totalAmount: number }>();

    ordersWithDetails.forEach((order) => {
      order.items.forEach((item) => {
        const existing = itemMap.get(item.menuItemId);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.totalAmount += item.subtotal;
        } else {
          itemMap.set(item.menuItemId, {
            menuItem: item.menuItem,
            totalQuantity: item.quantity,
            totalAmount: item.subtotal,
          });
        }
      });
    });

    const itemSummary = Array.from(itemMap.values()).sort((a, b) => 
      b.totalQuantity - a.totalQuantity
    );

    // Get restaurant details
    const { RestaurantModel } = await import('../models/Restaurant');
    const restaurant = await RestaurantModel.findById(votingPeriod.winnerRestaurantId);
    
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    return {
      date: targetDate,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
      },
      orders: ordersWithDetails,
      totalOrders,
      totalAmount,
      itemSummary,
    };
  }

  static async exportOrders(date?: Date, format: 'text' | 'csv' | 'json' = 'text'): Promise<string> {
    const groupOrder = await this.getGroupOrder(date);

    const exportData = {
      date: groupOrder.date,
      restaurant: groupOrder.restaurant,
      orders: groupOrder.orders.map((order) => ({
        employeeName: order.user.name,
        items: order.items.map((item) => ({
          itemName: item.menuItem.name,
          quantity: item.quantity,
          notes: item.notes,
          price: item.menuItem.price,
          subtotal: item.subtotal,
        })),
        total: order.totalAmount,
      })),
      summary: {
        totalOrders: groupOrder.totalOrders,
        totalAmount: groupOrder.totalAmount,
        itemBreakdown: groupOrder.itemSummary.map((item) => ({
          itemName: item.menuItem.name,
          totalQuantity: item.totalQuantity,
          totalAmount: item.totalAmount,
        })),
      },
    };

    const { ExportFormatter } = await import('../utils/exportFormatter');

    switch (format) {
      case 'csv':
        return ExportFormatter.formatAsCSV(exportData);
      case 'json':
        return ExportFormatter.formatAsJSON(exportData);
      case 'text':
      default:
        return ExportFormatter.formatAsText(exportData);
    }
  }
}
