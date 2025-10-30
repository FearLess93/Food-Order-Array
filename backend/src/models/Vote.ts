import pool from '../config/database';
import { Vote } from '../types';

export class VoteModel {
  static async create(
    userId: string,
    restaurantId: string,
    votingPeriodId: string
  ): Promise<Vote> {
    const query = `
      INSERT INTO votes (user_id, restaurant_id, voting_period_id)
      VALUES ($1, $2, $3)
      RETURNING id, user_id as "userId", restaurant_id as "restaurantId",
                voting_period_id as "votingPeriodId", created_at as "createdAt"
    `;
    
    const result = await pool.query(query, [userId, restaurantId, votingPeriodId]);
    return result.rows[0];
  }

  static async findByUserAndPeriod(userId: string, votingPeriodId: string): Promise<Vote | null> {
    const query = `
      SELECT id, user_id as "userId", restaurant_id as "restaurantId",
             voting_period_id as "votingPeriodId", created_at as "createdAt"
      FROM votes
      WHERE user_id = $1 AND voting_period_id = $2
    `;
    
    const result = await pool.query(query, [userId, votingPeriodId]);
    return result.rows[0] || null;
  }

  static async hasUserVoted(userId: string, votingPeriodId: string): Promise<boolean> {
    const vote = await this.findByUserAndPeriod(userId, votingPeriodId);
    return vote !== null;
  }

  static async getVoteCountsByPeriod(
    votingPeriodId: string
  ): Promise<Array<{ restaurantId: string; voteCount: number }>> {
    const query = `
      SELECT restaurant_id as "restaurantId", COUNT(*) as "voteCount"
      FROM votes
      WHERE voting_period_id = $1
      GROUP BY restaurant_id
      ORDER BY "voteCount" DESC
    `;
    
    const result = await pool.query(query, [votingPeriodId]);
    return result.rows.map(row => ({
      restaurantId: row.restaurantId,
      voteCount: parseInt(row.voteCount),
    }));
  }

  static async getTotalVoteCount(votingPeriodId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM votes
      WHERE voting_period_id = $1
    `;
    
    const result = await pool.query(query, [votingPeriodId]);
    return parseInt(result.rows[0].count);
  }

  static async deleteByPeriod(votingPeriodId: string): Promise<number> {
    const query = 'DELETE FROM votes WHERE voting_period_id = $1';
    const result = await pool.query(query, [votingPeriodId]);
    return result.rowCount || 0;
  }
}
