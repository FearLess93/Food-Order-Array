import pool from '../config/database';
import { MenuItem } from '../types';

export class MenuItemModel {
  static async create(
    restaurantId: string,
    name: string,
    description: string,
    price: number,
    category: string,
    imageUrl?: string
  ): Promise<MenuItem> {
    const query = `
      INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, restaurant_id as "restaurantId", name, description, price, category,
                image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [restaurantId, name, description, price, category, imageUrl]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<MenuItem | null> {
    const query = `
      SELECT id, restaurant_id as "restaurantId", name, description, price, category,
             image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
      FROM menu_items
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByRestaurant(restaurantId: string, availableOnly: boolean = false): Promise<MenuItem[]> {
    const query = availableOnly
      ? `SELECT id, restaurant_id as "restaurantId", name, description, price, category,
                image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
         FROM menu_items
         WHERE restaurant_id = $1 AND is_available = true
         ORDER BY category ASC, name ASC`
      : `SELECT id, restaurant_id as "restaurantId", name, description, price, category,
                image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
         FROM menu_items
         WHERE restaurant_id = $1
         ORDER BY category ASC, name ASC`;
    
    const result = await pool.query(query, [restaurantId]);
    return result.rows;
  }

  static async update(
    id: string,
    updates: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string;
      isAvailable: boolean;
    }>
  ): Promise<MenuItem | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(updates.price);
    }
    if (updates.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(updates.category);
    }
    if (updates.imageUrl !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(updates.imageUrl);
    }
    if (updates.isAvailable !== undefined) {
      fields.push(`is_available = $${paramCount++}`);
      values.push(updates.isAvailable);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE menu_items
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, restaurant_id as "restaurantId", name, description, price, category,
                image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM menu_items WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async deleteByRestaurant(restaurantId: string): Promise<number> {
    const query = 'DELETE FROM menu_items WHERE restaurant_id = $1';
    const result = await pool.query(query, [restaurantId]);
    return result.rowCount || 0;
  }

  static async bulkCreate(items: Array<{
    restaurantId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string;
  }>): Promise<MenuItem[]> {
    if (items.length === 0) return [];

    const values: any[] = [];
    const placeholders: string[] = [];
    let paramCount = 1;

    items.forEach((item) => {
      placeholders.push(
        `($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`
      );
      values.push(
        item.restaurantId,
        item.name,
        item.description,
        item.price,
        item.category,
        item.imageUrl || null
      );
    });

    const query = `
      INSERT INTO menu_items (restaurant_id, name, description, price, category, image_url)
      VALUES ${placeholders.join(', ')}
      RETURNING id, restaurant_id as "restaurantId", name, description, price, category,
                image_url as "imageUrl", is_available as "isAvailable", created_at as "createdAt"
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
}
