import pool from '../config/database';
import { Order } from '../types';

export class OrderModel {
  static async create(
    userId: string,
    restaurantId: string,
    votingPeriodId: string,
    totalAmount: number
  ): Promise<Order> {
    const query = `
      INSERT INTO orders (user_id, restaurant_id, voting_period_id, total_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id as "userId", restaurant_id as "restaurantId",
                voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [userId, restaurantId, votingPeriodId, totalAmount]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<Order | null> {
    const query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId",
             voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async findByUser(userId: string): Promise<Order[]> {
    const query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId",
             voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async findByVotingPeriod(votingPeriodId: string): Promise<Order[]> {
    const query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId",
             voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      WHERE voting_period_id = $1
      ORDER BY created_at ASC
    `;
    
    const result = await pool.query(query, [votingPeriodId]);
    return result.rows;
  }

  static async findByUserAndPeriod(userId: string, votingPeriodId: string): Promise<Order | null> {
    const query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId",
             voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      WHERE user_id = $1 AND voting_period_id = $2
    `;
    
    const result = await pool.query(query, [userId, votingPeriodId]);
    return result.rows[0] || null;
  }

  static async updateStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<Order | null> {
    const query = `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, user_id as "userId", restaurant_id as "restaurantId",
                voting_period_id as "votingPeriodId", status, total_amount as "totalAmount",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM orders WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
