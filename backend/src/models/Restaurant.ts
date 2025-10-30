import pool from '../config/database';
import { Restaurant } from '../types';

export class RestaurantModel {
  static async create(
    name: string,
    cuisine: string,
    imageUrl?: string
  ): Promise<Restaurant> {
    const query = `
      INSERT INTO restaurants (name, cuisine, image_url)
      VALUES ($1, $2, $3)
      RETURNING id, name, cuisine, image_url as "imageUrl", is_active as "isActive", 
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [name, cuisine, imageUrl]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Restaurant | null> {
    const query = `
      SELECT id, name, cuisine, image_url as "imageUrl", is_active as "isActive",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM restaurants
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findAll(activeOnly: boolean = false): Promise<Restaurant[]> {
    const query = activeOnly
      ? `SELECT id, name, cuisine, image_url as "imageUrl", is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM restaurants
         WHERE is_active = true
         ORDER BY name ASC`
      : `SELECT id, name, cuisine, image_url as "imageUrl", is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
         FROM restaurants
         ORDER BY name ASC`;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async update(
    id: string,
    updates: Partial<{ name: string; cuisine: string; imageUrl: string; isActive: boolean }>
  ): Promise<Restaurant | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.cuisine !== undefined) {
      fields.push(`cuisine = $${paramCount++}`);
      values.push(updates.cuisine);
    }
    if (updates.imageUrl !== undefined) {
      fields.push(`image_url = $${paramCount++}`);
      values.push(updates.imageUrl);
    }
    if (updates.isActive !== undefined) {
      fields.push(`is_active = $${paramCount++}`);
      values.push(updates.isActive);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE restaurants
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, cuisine, image_url as "imageUrl", is_active as "isActive",
                created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM restaurants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async exists(id: string): Promise<boolean> {
    const query = 'SELECT id FROM restaurants WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows.length > 0;
  }
}
