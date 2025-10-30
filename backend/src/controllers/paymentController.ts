import { Response, NextFunction } from 'express';
import { PaymentService } from '../services/paymentService';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  /**
   * Get payment status for a group
   * GET /api/groups/:groupId/payments
   */
  static async getGroupPayments(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      const { groupId } = req.params;

      const paymentSummary = await PaymentService.getGroupPayments(groupId, userId);

      res.status(200).json({
        success: true,
        data: paymentSummary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update payment status (owner only)
   * PUT /api/groups/:groupId/payments/:userId
   */
  static async updatePaymentStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
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

      const ownerId = req.user?.userId;
      if (!ownerId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        });
        return;
      }

      const { groupId, userId } = req.params;
      const { status } = req.body;

      const payment = await PaymentService.updatePaymentStatus(
        groupId,
        userId,
        ownerId,
        status
      );

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Mark own payment as pending
   * POST /api/groups/:groupId/payments/mark-pending
   */
  static async markAsPending(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
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

      const { groupId } = req.params;

      const payment = await PaymentService.markAsPending(groupId, userId);

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation middleware
export const updatePaymentValidation = [
  body('status')
    .isIn(['PAID', 'UNPAID', 'PENDING'])
    .withMessage('Status must be PAID, UNPAID, or PENDING'),
];
