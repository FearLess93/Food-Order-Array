import { Router } from 'express';
import {
  AuthController,
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { authLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, AuthController.register);
router.post('/login', authLimiter, loginValidation, AuthController.login);
router.post('/logout', AuthController.logout);

// Password reset routes
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidation,
  AuthController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  resetPasswordValidation,
  AuthController.resetPassword
);

// Protected routes
router.get('/me', authenticate, AuthController.getCurrentUser);

export default router;
