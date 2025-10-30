import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { CustomError } from './errorHandler';
import { UserModel } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new CustomError('No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);

    // Verify user still exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new CustomError('User not found', 401, 'USER_NOT_FOUND');
    }

    if (!user.isVerified) {
      throw new CustomError('Email not verified', 403, 'EMAIL_NOT_VERIFIED');
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new CustomError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
  }

  if (req.user.role !== 'admin') {
    throw new CustomError('Admin access required', 403, 'ADMIN_ACCESS_REQUIRED');
  }

  next();
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = AuthService.verifyToken(token);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
