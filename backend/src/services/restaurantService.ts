import { Restaurant, MenuItem } from '@prisma/client';
import { RestaurantModel, RestaurantWithMenu } from '../models/Restaurant';
import { MenuItemModel } from '../models/MenuItem';

export class RestaurantService {
  /**
   * Get all restaurants
   */
  static async getAllRestaurants(): Promise<Restaurant[]> {
    return RestaurantModel.findAll();
  }

  /**
   * Get restaurant by ID
   */
  static async getRestaurantById(id: string): Promise<Restaurant> {
    const restaurant = await RestaurantModel.findById(id);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }
    return restaurant;
  }

  /**
   * Get restaurant menu
   */
  static async getRestaurantMenu(
    restaurantId: string,
    filters?: {
      search?: string;
      tags?: string[];
    }
  ): Promise<MenuItem[]> {
    // Verify restaurant exists
    await this.getRestaurantById(restaurantId);

    // Apply filters
    if (filters?.search) {
      return MenuItemModel.search(restaurantId, filters.search);
    }

    if (filters?.tags && filters.tags.length > 0) {
      return MenuItemModel.findByTags(restaurantId, filters.tags);
    }

    return MenuItemModel.findByRestaurantId(restaurantId);
  }

  /**
   * Get menu item by ID
   */
  static async getMenuItemById(id: string): Promise<MenuItem> {
    const menuItem = await MenuItemModel.findById(id);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    return menuItem;
  }
}
