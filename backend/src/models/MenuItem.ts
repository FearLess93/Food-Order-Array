import { MenuItem, Prisma } from '@prisma/client';
import prisma from '../config/database';

export class MenuItemModel {
  /**
   * Get all menu items for a restaurant
   */
  static async findByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    return prisma.menuItem.findMany({
      where: { restaurantId },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get menu item by ID
   */
  static async findById(id: string): Promise<MenuItem | null> {
    return prisma.menuItem.findUnique({
      where: { id },
      include: { restaurant: true },
    });
  }

  /**
   * Search menu items by name or description
   */
  static async search(restaurantId: string, query: string): Promise<MenuItem[]> {
    return prisma.menuItem.findMany({
      where: {
        restaurantId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Filter menu items by tags
   */
  static async findByTags(restaurantId: string, tags: string[]): Promise<MenuItem[]> {
    return prisma.menuItem.findMany({
      where: {
        restaurantId,
        tags: {
          hasSome: tags,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Create menu item
   */
  static async create(data: {
    restaurantId: string;
    name: string;
    description?: string;
    price: number | Prisma.Decimal;
    tags?: string[];
    imageUrl?: string;
  }): Promise<MenuItem> {
    return prisma.menuItem.create({
      data,
    });
  }

  /**
   * Update menu item
   */
  static async update(
    id: string,
    data: {
      name?: string;
      description?: string;
      price?: number | Prisma.Decimal;
      tags?: string[];
      imageUrl?: string;
    }
  ): Promise<MenuItem> {
    return prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete menu item
   */
  static async delete(id: string): Promise<MenuItem> {
    return prisma.menuItem.delete({
      where: { id },
    });
  }
}
