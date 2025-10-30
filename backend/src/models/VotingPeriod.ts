import pool from '../config/database';
import { VotingPeriod } from '../types';

export class VotingPeriodModel {
  static async create(
    date: Date,
    startTime: string = '09:00:00',
    endTime: string = '11:00:00'
  ): Promise<VotingPeriod> {
    const query = `
      INSERT INTO voting_periods (date, start_time, end_time)
      VALUES ($1, $2, $3)
      RETURNING id, date, start_time as "startTime", end_time as "endTime",
                winner_restaurant_id as "winnerRestaurantId", is_complete as "isComplete",
                created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [date, startTime, endTime]);
    return result.rows[0];
  }

  static async findByDate(date: Date): Promise<VotingPeriod | null> {
    const query = `
      SELECT id, date, start_time as "startTime", end_time as "endTime",
             winner_restaurant_id as "winnerRestaurantId", is_complete as "isComplete",
             created_at as "createdAt"
      FROM voting_periods
      WHERE date = $1
    `;
    
    const result = await pool.query(query, [date]);
    return result.rows[0] || null;
  }

  static async findById(id: string): Promise<VotingPeriod | null> {
    const query = `
      SELECT id, date, start_time as "startTime", end_time as "endTime",
             winner_restaurant_id as "winnerRestaurantId", is_complete as "isComplete",
             created_at as "createdAt"
      FROM voting_periods
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async setWinner(id: string, winnerRestaurantId: string): Promise<void> {
    const query = `
      UPDATE voting_periods
      SET winner_restaurant_id = $1, is_complete = true
      WHERE id = $2
    `;
    
    await pool.query(query, [winnerRestaurantId, id]);
  }

  static async markComplete(id: string): Promise<void> {
    const query = `
      UPDATE voting_periods
      SET is_complete = true
      WHERE id = $1
    `;
    
    await pool.query(query, [id]);
  }

  static async getOrCreate(date: Date): Promise<VotingPeriod> {
    let period = await this.findByDate(date);
    
    if (!period) {
      period = await this.create(date);
    }
    
    return period;
  }
}
