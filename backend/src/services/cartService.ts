import { CartModel, CartWithItems } from '../models/Cart';
import { GroupModel } from '../models/Group';
import { MenuItemModel } from '../models/MenuItem';

export interface AddToCartInput {
  groupId: string;
  userId: string;
  menuItemId: string;
  quantity: number;
}

export interface CartSummary {
  carts: CartWithItems[];
  totals: {
    groupTotal: number;
    userTotals: { userId: string; userName: string; total: number }[];
  };
}

export class CartService {
  /**
   * Get all cart items for a group
   */
  static async getGroupCart(groupId: string, userId: string): Promise<CartSummary> {
    // Verify group exists and user is a member
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    const isMember = await GroupModel.isMember(groupId, userId);
    if (!isMember && group.ownerId !== userId) {
      throw new Error('Not a member of this group');
    }

    // Get all carts for the group
    const carts = await CartModel.findByGroupId(groupId);

    // Calculate totals
    const { total: groupTotal, userTotals } = await CartModel.calculateGroupTotal(groupId);

    return { carts, totals: { groupTotal, userTotals } };
  }

  /**
   * Add item to cart
   */
  static async addToCart(input: AddToCartInput): Promise<CartWithItems> {
    const { groupId, userId, menuItemId, quantity } = input;

    // Validate quantity
    if (quantity < 1 || quantity > 99) {
      throw new Error('Quantity must be between 1 and 99');
    }

    // Verify group exists and is open
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (group.isClosed) {
      throw new Error('Cannot add items to closed group');
    }

    if (group.endAt < new Date()) {
      throw new Error('Group has expired');
    }

    // Verify user is a member
    const isMember = await GroupModel.isMember(groupId, userId);
    if (!isMember) {
      throw new Error('Must be a group member to add items');
    }

    // Verify menu item exists and belongs to group's restaurant
    const menuItem = await MenuItemModel.findById(menuItemId);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }

    if (menuItem.restaurantId !== group.restaurantId) {
      throw new Error('Menu item does not belong to this restaurant');
    }

    // Get or create cart
    const cart = await CartModel.getOrCreate(groupId, userId);

    // Add item to cart
    await CartModel.addItem(cart.id, menuItemId, quantity);

    // Return updated cart
    const updatedCart = await CartModel.findByIdWithItems(cart.id);
    if (!updatedCart) {
      throw new Error('Failed to retrieve updated cart');
    }

    return updatedCart;
  }

  /**
   * Remove item from cart
   */
  static async removeFromCart(itemId: string, userId: string): Promise<void> {
    // Get cart item with details
    const cartItem = await CartModel.findItemById(itemId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Verify user owns this cart item
    if (cartItem.cart.userId !== userId) {
      throw new Error('Can only delete your own cart items');
    }

    // Verify group is still open
    const group = await GroupModel.findById(cartItem.cart.groupId);
    if (group?.isClosed) {
      throw new Error('Cannot modify items in closed group');
    }

    // Remove item
    await CartModel.removeItem(itemId);
  }

  /**
   * Update cart item quantity
   */
  static async updateQuantity(
    itemId: string,
    userId: string,
    quantity: number
  ): Promise<void> {
    // Validate quantity
    if (quantity < 1 || quantity > 99) {
      throw new Error('Quantity must be between 1 and 99');
    }

    // Get cart item with details
    const cartItem = await CartModel.findItemById(itemId);
    if (!cartItem) {
      throw new Error('Cart item not found');
    }

    // Verify user owns this cart item
    if (cartItem.cart.userId !== userId) {
      throw new Error('Can only modify your own cart items');
    }

    // Verify group is still open
    const group = await GroupModel.findById(cartItem.cart.groupId);
    if (group?.isClosed) {
      throw new Error('Cannot modify items in closed group');
    }

    // Update quantity
    await CartModel.updateItemQuantity(itemId, quantity);
  }
}
