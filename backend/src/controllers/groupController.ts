import { Response, NextFunction } from 'express';
import { GroupService } from '../services/groupService';
import { body, query, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export class GroupController {
  /**
   * Create a new group
   * POST /api/groups
   */
  static async createGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { restaurantId, name, status, durationMinutes, maxMembers } = req.body;

      const group = await GroupService.createGroup({
        ownerId: userId,
        restaurantId,
        name,
        status,
        durationMinutes,
        maxMembers,
      });

      res.status(201).json({
        success: true,
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all groups with filters
   * GET /api/groups
   */
  static async getGroups(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user?.userId;
      const { status, myGroups, search } = req.query;

      const filters = {
        status: status as 'PUBLIC' | 'PRIVATE' | undefined,
        myGroups: myGroups === 'true',
        userId,
        search: search as string | undefined,
      };

      const groups = await GroupService.getGroups(filters);

      res.status(200).json({
        success: true,
        data: {
          groups,
          count: groups.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get group by ID
   * GET /api/groups/:id
   */
  static async getGroupById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;

      const group = await GroupService.getGroupById(id, userId);

      res.status(200).json({
        success: true,
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Join a group
   * POST /api/groups/:id/join
   */
  static async joinGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Validation failed',
            details: errors.array(),
          },
        });
        return;
      }

      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;
      const { joinCode } = req.body;

      const group = await GroupService.joinGroup(id, userId, joinCode);

      res.status(200).json({
        success: true,
        data: { group },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a group
   * DELETE /api/groups/:id
   */
  static async deleteGroup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { id } = req.params;

      await GroupService.deleteGroup(id, userId);

      res.status(200).json({
        success: true,
        message: 'Group deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
export const createGroupValidation = [
  body('restaurantId').isUUID().withMessage('Valid restaurant ID is required'),
  body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
  body('status').isIn(['PUBLIC', 'PRIVATE']).withMessage('Status must be PUBLIC or PRIVATE'),
  body('durationMinutes')
    .isInt({ min: 15, max: 1440 })
    .withMessage('Duration must be between 15 and 1440 minutes'),
  body('maxMembers').optional().isInt({ min: 2 }).withMessage('Max members must be at least 2'),
];

export const getGroupsValidation = [
  query('status').optional().isIn(['PUBLIC', 'PRIVATE']),
  query('myGroups').optional().isBoolean(),
  query('search').optional().isString().trim(),
];

export const joinGroupValidation = [
  body('joinCode').optional().isString().trim(),
];
