import { User } from '@prisma/client';
import prisma from '../config/database';

export type UserCreateInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type UserUpdateInput = {
  name?: string;
  email?: string;
  passwordHash?: string;
};

export type SafeUser = Omit<User, 'passwordHash'>;

export class UserModel {
  // Create a new user
  static async create(data: UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  // Find user by ID
  static async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  // Update user
  static async update(id: string, data: UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Delete user
  static async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  // Check if email exists
  static async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  // Get all users (for admin purposes)
  static async findAll(): Promise<User[]> {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Remove password hash from user object
  static toSafeUser(user: User): SafeUser {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
