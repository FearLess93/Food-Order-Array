import { Response, NextFunction } from 'express';
import { VotingService } from '../services/votingService';
import { AuthRequest } from '../middleware/auth';

export class VotingController {
  static async getAvailableRestaurants(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const restaurants = await VotingService.getAvailableRestaurants(date);

      res.status(200).json({
        success: true,
        data: { restaurants, count: restaurants.length },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async castVote(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const { restaurantId } = req.body;
      const dateStr = req.body.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      if (!restaurantId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_FIELDS',
            message: 'Restaurant ID is required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const result = await VotingService.castVote(req.user.userId, restaurantId, date);

      res.status(201).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async hasUserVoted(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const hasVoted = await VotingService.hasUserVoted(req.user.userId, date);

      res.status(200).json({
        success: true,
        data: { hasVoted },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVotingResults(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const results = await VotingService.getVotingResults(date);

      res.status(200).json({
        success: true,
        data: results,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async closeVoting(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.body.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const result = await VotingService.closeVoting(date);

      res.status(200).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  static async isVotingActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;

      const isActive = await VotingService.isVotingActive(date);

      res.status(200).json({
        success: true,
        data: { isActive },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
