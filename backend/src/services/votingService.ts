import { VotingPeriodModel } from '../models/VotingPeriod';
import { VoteModel } from '../models/Vote';
import { RestaurantModel } from '../models/Restaurant';
import { DailyRestaurantModel } from '../models/DailyRestaurant';
import { Restaurant } from '../types';
import { CustomError } from '../middleware/errorHandler';

export class VotingService {
  static async getAvailableRestaurants(date?: Date): Promise<Restaurant[]> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Check if there are specific restaurants set for this date
    const hasDailyRestaurants = await DailyRestaurantModel.hasDailyRestaurants(targetDate);
    
    if (hasDailyRestaurants) {
      const restaurantIds = await DailyRestaurantModel.getDailyRestaurants(targetDate);
      const restaurants: Restaurant[] = [];
      
      for (const id of restaurantIds) {
        const restaurant = await RestaurantModel.findById(id);
        if (restaurant && restaurant.isActive) {
          restaurants.push(restaurant);
        }
      }
      
      return restaurants;
    }

    // If no specific restaurants set, return all active restaurants
    return await RestaurantModel.findAll(true);
  }

  static async castVote(userId: string, restaurantId: string, date?: Date): Promise<{ message: string; voteCount: number }> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get or create voting period
    const votingPeriod = await VotingPeriodModel.getOrCreate(targetDate);

    // Check if voting period is still active
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    if (currentTime < votingPeriod.startTime) {
      throw new CustomError('Voting has not started yet', 400, 'VOTING_NOT_STARTED');
    }
    
    if (currentTime > votingPeriod.endTime || votingPeriod.isComplete) {
      throw new CustomError('Voting period has ended', 400, 'VOTING_ENDED');
    }

    // Check if user has already voted
    const hasVoted = await VoteModel.hasUserVoted(userId, votingPeriod.id);
    if (hasVoted) {
      throw new CustomError('You have already voted for today', 400, 'ALREADY_VOTED');
    }

    // Verify restaurant exists and is active
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new CustomError('Restaurant not found', 404, 'RESTAURANT_NOT_FOUND');
    }
    if (!restaurant.isActive) {
      throw new CustomError('Restaurant is not available', 400, 'RESTAURANT_NOT_AVAILABLE');
    }

    // Verify restaurant is available for voting today
    const availableRestaurants = await this.getAvailableRestaurants(targetDate);
    const isAvailable = availableRestaurants.some(r => r.id === restaurantId);
    if (!isAvailable) {
      throw new CustomError('Restaurant is not available for voting today', 400, 'RESTAURANT_NOT_AVAILABLE_TODAY');
    }

    // Cast vote
    await VoteModel.create(userId, restaurantId, votingPeriod.id);

    // Get current vote count for this restaurant
    const voteCounts = await VoteModel.getVoteCountsByPeriod(votingPeriod.id);
    const restaurantVotes = voteCounts.find(v => v.restaurantId === restaurantId);
    const voteCount = restaurantVotes ? restaurantVotes.voteCount : 1;

    return {
      message: 'Vote cast successfully',
      voteCount,
    };
  }

  static async hasUserVoted(userId: string, date?: Date): Promise<boolean> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod) {
      return false;
    }

    return await VoteModel.hasUserVoted(userId, votingPeriod.id);
  }

  static async getVotingResults(date?: Date): Promise<{
    date: Date;
    restaurants: Array<{ restaurant: Restaurant; voteCount: number }>;
    winner?: Restaurant;
    isComplete: boolean;
    totalVotes: number;
  }> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod) {
      return {
        date: targetDate,
        restaurants: [],
        isComplete: false,
        totalVotes: 0,
      };
    }

    const voteCounts = await VoteModel.getVoteCountsByPeriod(votingPeriod.id);
    const totalVotes = await VoteModel.getTotalVoteCount(votingPeriod.id);

    const restaurants = await Promise.all(
      voteCounts.map(async (vc) => {
        const restaurant = await RestaurantModel.findById(vc.restaurantId);
        return {
          restaurant: restaurant!,
          voteCount: vc.voteCount,
        };
      })
    );

    let winner: Restaurant | undefined;
    if (votingPeriod.winnerRestaurantId) {
      winner = (await RestaurantModel.findById(votingPeriod.winnerRestaurantId)) || undefined;
    }

    return {
      date: targetDate,
      restaurants,
      winner,
      isComplete: votingPeriod.isComplete,
      totalVotes,
    };
  }

  static async determineWinner(date?: Date): Promise<Restaurant> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod) {
      throw new CustomError('No voting period found for this date', 404, 'VOTING_PERIOD_NOT_FOUND');
    }

    if (votingPeriod.isComplete && votingPeriod.winnerRestaurantId) {
      const winner = await RestaurantModel.findById(votingPeriod.winnerRestaurantId);
      if (winner) {
        return winner;
      }
    }

    const voteCounts = await VoteModel.getVoteCountsByPeriod(votingPeriod.id);
    
    if (voteCounts.length === 0) {
      throw new CustomError('No votes cast yet', 400, 'NO_VOTES');
    }

    // Winner is the restaurant with the most votes (first in sorted array)
    const winnerRestaurantId = voteCounts[0].restaurantId;
    const winner = await RestaurantModel.findById(winnerRestaurantId);
    
    if (!winner) {
      throw new CustomError('Winner restaurant not found', 404, 'WINNER_NOT_FOUND');
    }

    // Update voting period with winner
    await VotingPeriodModel.setWinner(votingPeriod.id, winnerRestaurantId);

    return winner;
  }

  static async closeVoting(date?: Date): Promise<{ winner: Restaurant; message: string }> {
    const winner = await this.determineWinner(date);
    
    return {
      winner,
      message: 'Voting closed and winner determined',
    };
  }

  static async isVotingActive(date?: Date): Promise<boolean> {
    const targetDate = date || new Date();
    targetDate.setHours(0, 0, 0, 0);

    const votingPeriod = await VotingPeriodModel.findByDate(targetDate);
    if (!votingPeriod || votingPeriod.isComplete) {
      return false;
    }

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    return currentTime >= votingPeriod.startTime && currentTime <= votingPeriod.endTime;
  }
}
