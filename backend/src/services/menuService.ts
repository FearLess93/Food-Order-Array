import { MenuItemModel } from '../models/MenuItem';
import { RestaurantModel } from '../models/Restaurant';
import { MenuItem } from '../types';
import { CustomError } from '../middleware/errorHandler';

export class MenuService {
  static async createMenuItem(
    restaurantId: string,
    name: string,
    description: string,
    price: number,
    category: string,
    imageUrl?: string
  ): Promise<MenuItem> {
    // Verify restaurant exists
    const restaurantExists = await RestaurantModel.exists(restaurantId);
    if (!restaurantExists) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    if (!name || !description || price === undefined || !category) {
      throw new CustomError(
        'Name, description, price, and category are required',
        400,
        'MISSING_FIELDS'
      );
    }

    if (price < 0) {
      throw new CustomError('Price must be a positive number', 400, 'INVALID_PRICE');
    }

    return await MenuItemModel.create(restaurantId, name, description, price, category, imageUrl);
  }

  static async getMenuItem(id: string): Promise<MenuItem> {
    const menuItem = await MenuItemModel.findById(id);
    
    if (!menuItem) {
      throw new CustomError('Menu item not found', 404, 'MENU_ITEM_NOT_FOUND');
    }

    return menuItem;
  }

  static async getRestaurantMenu(restaurantId: string, availableOnly: boolean = false): Promise<MenuItem[]> {
    // Verify restaurant exists
    const restaurantExists = await RestaurantModel.exists(restaurantId);
    if (!restaurantExists) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    return await MenuItemModel.findByRestaurant(restaurantId, availableOnly);
  }

  static async updateMenuItem(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
      isAvailable: boolean;
    }>
  ): Promise<MenuItem> {
    const menuItem = await MenuItemModel.findById(id);
    
    if (!menuItem) {
      throw new CustomError('Menu item not found', 404, 'MENU_ITEM_NOT_FOUND');
    }

    if (updates.price !== undefined && updates.price < 0) {
      throw new CustomError('Price must be a positive number', 400, 'INVALID_PRICE');
    }

    const updated = await MenuItemModel.update(id, updates);
    
    if (!updated) {
      throw new CustomError('Failed to update menu item', 500, 'UPDATE_FAILED');
    }

    return updated;
  }

  static async deleteMenuItem(id: string): Promise<void> {
    const menuItem = await MenuItemModel.findById(id);
    
    if (!menuItem) {
      throw new CustomError('Menu item not found', 404, 'MENU_ITEM_NOT_FOUND');
    }

    const deleted = await MenuItemModel.delete(id);
    
    if (!deleted) {
      throw new CustomError('Failed to delete menu item', 500, 'DELETE_FAILED');
    }
  }

  static async bulkUploadMenu(
    restaurantId: string,
    items: Array<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl?: string;
    }>
  ): Promise<MenuItem[]> {
    // Verify restaurant exists
    const restaurantExists = await RestaurantModel.exists(restaurantId);
    if (!restaurantExists) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    if (!items || items.length === 0) {
      throw new CustomError('No menu items provided', 400, 'NO_ITEMS');
    }

    // Validate all items
    for (const item of items) {
      if (!item.name || !item.description || item.price === undefined || !item.category) {
        throw new CustomError(
          'Each item must have name, description, price, and category',
          400,
          'INVALID_ITEM'
        );
      }
      if (item.price < 0) {
        throw new CustomError('All prices must be positive numbers', 400, 'INVALID_PRICE');
      }
    }

    // Add restaurantId to all items
    const itemsWithRestaurant = items.map(item => ({
      ...item,
      restaurantId,
    }));

    return await MenuItemModel.bulkCreate(itemsWithRestaurant);
  }

  static async replaceRestaurantMenu(
    restaurantId: string,
    items: Array<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl?: string;
    }>
  ): Promise<MenuItem[]> {
    // Verify restaurant exists
    const restaurantExists = await RestaurantModel.exists(restaurantId);
    if (!restaurantExists) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    // Delete existing menu items
    await MenuItemModel.deleteByRestaurant(restaurantId);

    // Upload new menu
    return await this.bulkUploadMenu(restaurantId, items);
  }
}
