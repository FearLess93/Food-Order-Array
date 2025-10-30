import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { User } from '../types';
import { config } from '../config/env';
import { CustomError } from '../middleware/errorHandler';
import { validateEmailDomain, validateEmail, validatePassword } from '../utils/validation';
import { sendVerificationEmail, generateVerificationCode } from '../utils/email';

const SALT_ROUNDS = 10;
const VERIFICATION_CODE_EXPIRY_MINUTES = 15;

export class AuthService {
  static async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ user: User; message: string }> {
    // Validate email format
    if (!validateEmail(email)) {
      throw new CustomError('Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Validate email domain
    if (!validateEmailDomain(email)) {
      throw new CustomError(
        `Only ${config.company.allowedEmailDomain} email addresses are allowed`,
        403,
        'INVALID_EMAIL_DOMAIN'
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw new CustomError(
        passwordValidation.message || 'Invalid password',
        400,
        'INVALID_PASSWORD'
      );
    }

    // Check if email is already taken
    const emailTaken = await UserModel.isEmailTaken(email);
    if (emailTaken) {
      throw new CustomError('Email already registered', 409, 'EMAIL_ALREADY_EXISTS');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await UserModel.create(email, passwordHash, name);

    // Generate and send verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);
    
    await UserModel.updateVerificationCode(user.id, verificationCode, expiresAt);
    await sendVerificationEmail(email, verificationCode);

    return {
      user,
      message: 'Registration successful. Please check your email for verification code.',
    };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; token: string; refreshToken: string }> {
    // Find user by email
    const userWithPassword = await UserModel.findByEmail(email);
    if (!userWithPassword) {
      throw new CustomError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check if email is verified
    if (!userWithPassword.isVerified) {
      throw new CustomError(
        'Email not verified. Please verify your email first.',
        403,
        'EMAIL_NOT_VERIFIED'
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userWithPassword.passwordHash);
    if (!isPasswordValid) {
      throw new CustomError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Remove password hash from user object
    const { passwordHash, ...user } = userWithPassword;

    // Generate tokens
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return { user, token, refreshToken };
  }

  static async verifyEmail(userId: string, code: string): Promise<{ message: string }> {
    // Get verification code from database
    const storedCode = await UserModel.getVerificationCode(userId);
    
    if (!storedCode) {
      throw new CustomError('No verification code found', 404, 'CODE_NOT_FOUND');
    }

    // Check if code has expired
    if (new Date() > storedCode.expires) {
      throw new CustomError('Verification code has expired', 400, 'CODE_EXPIRED');
    }

    // Verify code
    if (storedCode.code !== code) {
      throw new CustomError('Invalid verification code', 400, 'INVALID_CODE');
    }

    // Mark email as verified
    await UserModel.verifyEmail(userId);

    return { message: 'Email verified successfully' };
  }

  static async resendVerificationCode(email: string): Promise<{ message: string }> {
    const userWithPassword = await UserModel.findByEmail(email);
    
    if (!userWithPassword) {
      throw new CustomError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (userWithPassword.isVerified) {
      throw new CustomError('Email already verified', 400, 'ALREADY_VERIFIED');
    }

    // Generate and send new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY_MINUTES * 60 * 1000);
    
    await UserModel.updateVerificationCode(userWithPassword.id, verificationCode, expiresAt);
    await sendVerificationEmail(email, verificationCode);

    return { message: 'Verification code sent successfully' };
  }

  static generateToken(user: User): string {
    // @ts-ignore
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  static generateRefreshToken(user: User): string {
    // @ts-ignore
    return jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  static verifyToken(token: string): { userId: string; email: string; role: string } {
    try {
      return jwt.verify(token, config.jwt.secret) as { userId: string; email: string; role: string };
    } catch (error) {
      throw new CustomError('Invalid or expired token', 401, 'INVALID_TOKEN');
    }
  }

  static verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
    } catch (error) {
      throw new CustomError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }
}
