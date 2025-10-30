import { PasswordResetToken } from '@prisma/client';
import prisma from '../config/database';

export class PasswordResetTokenModel {
  /**
   * Create a password reset token
   */
  static async create(userId: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    // Delete any existing tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId },
    });

    return prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  /**
   * Find token by token string
   */
  static async findByToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Delete token
   */
  static async delete(id: string): Promise<void> {
    await prisma.passwordResetToken.delete({
      where: { id },
    });
  }

  /**
   * Delete expired tokens
   */
  static async deleteExpired(): Promise<number> {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Check if token is valid (exists and not expired)
   */
  static async isValid(token: string): Promise<boolean> {
    const resetToken = await this.findByToken(token);
    if (!resetToken) return false;
    return resetToken.expiresAt > new Date();
  }
}
