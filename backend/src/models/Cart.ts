import { Cart, CartItem, MenuItem, User, Prisma } from '@prisma/client';
import prisma from '../config/database';

export type CartWithItems = Cart & {
  items: (CartItem & {
    menuItem: MenuItem;
  })[];
  user: User;
};

export type CartItemWithDetails = CartItem & {
  menuItem: MenuItem;
  cart: Cart & {
    user: User;
  };
};

export class CartModel {
  /**
   * Get or create cart for user in group
   */
  static async getOrCreate(groupId: string, userId: string): Promise<Cart> {
    let cart = await prisma.cart.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          groupId,
          userId,
        },
      });
    }

    return cart;
  }

  /**
   * Get cart with items
   */
  static async findByIdWithItems(cartId: string): Promise<CartWithItems | null> {
    return prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
          orderBy: { addedAt: 'asc' },
        },
        user: true,
      },
    });
  }

  /**
   * Get all carts for a group with items
   */
  static async findByGroupId(groupId: string): Promise<CartWithItems[]> {
    return prisma.cart.findMany({
      where: { groupId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
          orderBy: { addedAt: 'asc' },
        },
        user: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Add item to cart
   */
  static async addItem(
    cartId: string,
    menuItemId: string,
    quantity: number
  ): Promise<CartItem> {
    return prisma.cartItem.create({
      data: {
        cartId,
        menuItemId,
        quantity,
      },
    });
  }

  /**
   * Update cart item quantity
   */
  static async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: string): Promise<CartItem> {
    return prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Get cart item by ID with details
   */
  static async findItemById(itemId: string): Promise<CartItemWithDetails | null> {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        menuItem: true,
        cart: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * Calculate cart total
   */
  static async calculateTotal(cartId: string): Promise<number> {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    if (!cart) return 0;

    return cart.items.reduce((total, item) => {
      const price = typeof item.menuItem.price === 'number' 
        ? item.menuItem.price 
        : parseFloat(item.menuItem.price.toString());
      return total + price * item.quantity;
    }, 0);
  }

  /**
   * Calculate group total
   */
  static async calculateGroupTotal(groupId: string): Promise<{
    total: number;
    userTotals: { userId: string; userName: string; total: number }[];
  }> {
    const carts = await this.findByGroupId(groupId);

    const userTotals = carts.map((cart) => {
      const total = cart.items.reduce((sum, item) => {
        const price = typeof item.menuItem.price === 'number'
          ? item.menuItem.price
          : parseFloat(item.menuItem.price.toString());
        return sum + price * item.quantity;
      }, 0);

      return {
        userId: cart.userId,
        userName: cart.user.name,
        total,
      };
    });

    const total = userTotals.reduce((sum, user) => sum + user.total, 0);

    return { total, userTotals };
  }

  /**
   * Clear cart
   */
  static async clearCart(cartId: string): Promise<void> {
    await prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
