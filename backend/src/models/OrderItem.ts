import pool from '../config/database';
import { OrderItem } from '../types';

export class OrderItemModel {
  static async create(
    orderId: string,
    menuItemId: string,
    quantity: number,
    notes: string | undefined,
    subtotal: number
  ): Promise<OrderItem> {
    const query = `
      INSERT INTO order_items (order_id, menu_item_id, quantity, notes, subtotal)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, order_id as "orderId", menu_item_id as "menuItemId",
                quantity, notes, subtotal, created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [orderId, menuItemId, quantity, notes || null, subtotal]);
    return result.rows[0];
  }

  static async findByOrder(orderId: string): Promise<OrderItem[]> {
    const query = `
      SELECT id, order_id as "orderId", menu_item_id as "menuItemId",
             quantity, notes, subtotal, created_at as "createdAt"
      FROM order_items
      WHERE order_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [orderId]);
    return result.rows;
  }

  static async bulkCreate(items: Array<{
    orderId: string;
    menuItemId: string;
    quantity: number;
    notes?: string;
    subtotal: number;
  }>): Promise<OrderItem[]> {
    if (items.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    items.forEach((item) => {
      placeholders.push(
        `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`
      );
      values.push(
        item.orderId,
        item.menuItemId,
        item.quantity,
        item.notes || null,
        item.subtotal
      );
    });

    const query = `
      INSERT INTO order_items (order_id, menu_item_id, quantity, notes, subtotal)
      VALUES ${placeholders.join(', ')}
      RETURNING id, order_id as "orderId", menu_item_id as "menuItemId",
                quantity, notes, subtotal, created_at as "createdAt"
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async deleteByOrder(orderId: string): Promise<number> {
    const query = 'DELETE FROM order_items WHERE order_id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rowCount || 0;
  }
}
