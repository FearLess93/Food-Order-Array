import { Router } from 'express';
import { PaymentController, updatePaymentValidation } from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All payment routes require authentication

// Get payment status for a group
router.get('/groups/:groupId/payments', authenticate, PaymentController.getGroupPayments);

// Update payment status (owner only)
router.put(
  '/groups/:groupId/payments/:userId',
  authenticate,
  updatePaymentValidation,
  PaymentController.updatePaymentStatus
);

// Mark own payment as pending
router.post('/groups/:groupId/payments/mark-pending', authenticate, PaymentController.markAsPending);

export default router;
