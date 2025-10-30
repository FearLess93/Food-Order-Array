import { User } from '@prisma/client';
import { UserModel, SafeUser } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password';
import { generateToken, JwtPayload, verifyToken } from '../utils/jwt';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: SafeUser;
  token: string;
}

export class AuthService {
  /**
   * Register a new user
   * Validates @array.world email domain and password strength
   */
  static async register(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password } = input;

    // Validate email domain
    if (!email.endsWith('@array.world')) {
      throw new Error('Registration is restricted to @array.world email addresses');
    }

    // Check if email already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await UserModel.create({
      name,
      email,
      passwordHash,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: UserModel.toSafeUser(user),
      token,
    };
  }

  /**
   * Login user with email and password
   */
  static async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      user: UserModel.toSafeUser(user),
      token,
    };
  }

  /**
   * Verify JWT token and return user
   */
  static async verifyToken(token: string): Promise<SafeUser> {
    const payload = verifyToken(token);
    
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      throw new Error('User not found');
    }

    return UserModel.toSafeUser(user);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<SafeUser> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return UserModel.toSafeUser(user);
  }

  /**
   * Request password reset
   * Generates a reset token and sends email
   */
  static async requestPasswordReset(email: string): Promise<void> {
    const { PasswordResetTokenModel } = await import('../models/PasswordResetToken');
    const emailService = (await import('./emailService')).default;
    const { generatePasswordResetToken, hashResetToken } = await import('../utils/jwt');

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return;
    }

    // Generate reset token
    const { token, expiresAt } = generatePasswordResetToken();
    const hashedToken = hashResetToken(token);

    // Store hashed token in database
    await PasswordResetTokenModel.create(user.id, hashedToken, expiresAt);

    // Send email with plain token
    await emailService.sendPasswordResetEmail(email, token);
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const { PasswordResetTokenModel } = await import('../models/PasswordResetToken');
    const { hashResetToken } = await import('../utils/jwt');

    // Hash the token to compare with stored hash
    const hashedToken = hashResetToken(token);

    // Find reset token
    const resetToken = await PasswordResetTokenModel.findByToken(hashedToken);
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      await PasswordResetTokenModel.delete(resetToken.id);
      throw new Error('Reset token has expired');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password
    await UserModel.update(resetToken.userId, { passwordHash });

    // Delete used token
    await PasswordResetTokenModel.delete(resetToken.id);
  }
}
