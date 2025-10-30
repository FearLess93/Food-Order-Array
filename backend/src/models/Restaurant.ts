import { Restaurant, MenuItem } from '@prisma/client';
import prisma from '../config/database';

export type RestaurantWithMenu = Restaurant & {
  menuItems: MenuItem[];
};

export class RestaurantModel {
  /**
   * Get all restaurants
   */
  static async findAll(): Promise<Restaurant[]> {
    return prisma.restaurant.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get restaurant by ID
   */
  static async findById(id: string): Promise<Restaurant | null> {
    return prisma.restaurant.findUnique({
      where: { id },
    });
  }

  /**
   * Get restaurant with menu items
   */
  static async findByIdWithMenu(id: string): Promise<RestaurantWithMenu | null> {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          orderBy: { name: 'asc' },
        },
      },
    });
  }

  /**
   * Create restaurant
   */
  static async create(data: {
    name: string;
    description?: string;
    logoUrl?: string;
  }): Promise<Restaurant> {
    return prisma.restaurant.create({
      data,
    });
  }

  /**
   * Update restaurant
   */
  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      logoUrl?: string;
    }
  ): Promise<Restaurant> {
    return prisma.restaurant.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete restaurant
   */
  static async delete(id: string): Promise<Restaurant> {
    return prisma.restaurant.delete({
      where: { id },
    });
  }
}
