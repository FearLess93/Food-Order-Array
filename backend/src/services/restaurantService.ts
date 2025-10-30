import { RestaurantModel } from '../models/Restaurant';
import { Restaurant } from '../types';
import { CustomError } from '../middleware/errorHandler';

export class RestaurantService {
  static async createRestaurant(
    name: string,
    cuisine: string,
    imageUrl?: string
  ): Promise<Restaurant> {
    if (!name || !cuisine) {
      throw new CustomError('Name and cuisine are required', 400, 'MISSING_FIELDS');
    }

    return await RestaurantModel.create(name, cuisine, imageUrl);
  }

  static async getRestaurant(id: string): Promise<Restaurant> {
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    return restaurant;
  }

  static async getAllRestaurants(activeOnly: boolean = false): Promise<Restaurant[]> {
    return await RestaurantModel.findAll(activeOnly);
  }

  static async updateRestaurant(
    id: string,
    updates: Partial<{ name: string; cuisine: string; imageUrl: string; isActive: boolean }>
  ): Promise<Restaurant> {
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    const updated = await RestaurantModel.update(id, updates);
    
    if (!updated) {
      throw new CustomError('Failed to update restaurant', 500, 'UPDATE_FAILED');
    }

    return updated;
  }

  static async deleteRestaurant(id: string): Promise<void> {
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    const deleted = await RestaurantModel.delete(id);
    
    if (!deleted) {
      throw new CustomError('Failed to delete restaurant', 500, 'DELETE_FAILED');
    }
  }

  static async toggleRestaurantStatus(id: string): Promise<Restaurant> {
    const restaurant = await RestaurantModel.findById(id);
    
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }

    return await this.updateRestaurant(id, { isActive: !restaurant.isActive });
  }
}
