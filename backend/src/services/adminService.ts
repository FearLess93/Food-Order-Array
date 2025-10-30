import { VotingService } from './votingService';
import { OrderService } from './orderService';
import { VotingPeriodModel } from '../models/VotingPeriod';
import { OrderModel } from '../models/Order';
import { VoteModel } from '../models/Vote';
import { UserModel } from '../models/User';
import pool from '../config/database';

interface DailyStats {
  date: Date;
  totalEmployees: number;
  totalVotes: number;
  participationRate: number;
  totalOrders: number;
  orderParticipationRate: number;
  totalRevenue: number;
  winningRestaurant?: {
    id: string;
    name: string;
    voteCount: number;
  };
}

export class AdminService {
  static async getDailyStats(date?: Date): Promise<DailyStats> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get total employees
    const employeeCountQuery = 'SELECT COUNT(*) as count FROM users WHERE role = $1';
    const employeeResult = await pool.query(employeeCountQuery, ['employee']);
    const totalEmployees = parseInt(employeeResult.rows[0].count);

    // Get voting period
    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    
    if (!votingPeriod) {
      return {
        date: targetDate,
        totalEmployees,
        totalVotes: 0,
        participationRate: 0,
        totalOrders: 0,
        orderParticipationRate: 0,
        totalRevenue: 0,
      };
    }

    // Get voting stats
    const totalVotes = await VoteModel.getTotalVoteCount(votingPeriod.id);
    const participationRate = totalEmployees > 0 ? (totalVotes / totalEmployees) * 100 : 0;

    // Get order stats
    const orders = await OrderModel.findByVotingPeriod(votingPeriod.id);
    const totalOrders = orders.length;
    const orderParticipationRate = totalEmployees > 0 ? (totalOrders / totalEmployees) * 100 : 0;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Get winning restaurant info
    let winningRestaurant;
    if (votingPeriod.winnerRestaurantId) {
      const { RestaurantModel } = await import('../models/Restaurant');
      const restaurant = await RestaurantModel.findById(votingPeriod.winnerRestaurantId);
      const voteCounts = await VoteModel.getVoteCountsByPeriod(votingPeriod.id);
      const winnerVotes = voteCounts.find(v => v.restaurantId === votingPeriod.winnerRestaurantId);
      
      if (restaurant) {
        winningRestaurant = {
          id: restaurant.id,
          name: restaurant.name,
          voteCount: winnerVotes?.voteCount || 0,
        };
      }
    }

    return {
      date: targetDate,
      totalEmployees,
      totalVotes,
      participationRate: Math.round(participationRate * 100) / 100,
      totalOrders,
      orderParticipationRate: Math.round(orderParticipationRate * 100) / 100,
      totalRevenue,
      winningRestaurant,
    };
  }

  static async getVotingResultsDetailed(date?: Date) {
    return await VotingService.getVotingResults(date);
  }

  static async getGroupOrderDetailed(date?: Date): Promise<any> {
    return await OrderService.getGroupOrder(date);
  }

  static async getAllUsers() {
    const query = `
      SELECT id, email, name, role, is_verified as "isVerified",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateUserRole(userId: string, role: 'employee' | 'admin') {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      const { CustomError } = await import('../middleware/errorHandler');
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }

    const query = `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, email, name, role, is_verified as "isVerified",
                created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, [role, userId]);
    return result.rows[0];
  }

  static async getSystemOverview() {
    const totalUsersQuery = 'SELECT COUNT(*) as count FROM users';
    const totalRestaurantsQuery = 'SELECT COUNT(*) as count FROM restaurants WHERE is_active = true';
    const totalOrdersQuery = 'SELECT COUNT(*) as count FROM orders';
    const totalRevenueQuery = 'SELECT SUM(total_amount) as total FROM orders WHERE status != $1';

    const [usersResult, restaurantsResult, ordersResult, revenueResult] = await Promise.all([
      pool.query(totalUsersQuery),
      pool.query(totalRestaurantsQuery),
      pool.query(totalOrdersQuery),
      pool.query(totalRevenueQuery, ['cancelled']),
    ]);

    return {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalActiveRestaurants: parseInt(restaurantsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total || 0),
    };
  }
}
