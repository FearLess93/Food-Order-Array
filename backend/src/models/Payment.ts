import { Payment, PaymentStatus, User } from '@prisma/client';
import prisma from '../config/database';

export type PaymentWithUser = Payment & {
  user: User;
};

export class PaymentModel {
  /**
   * Create payment records for all group members
   */
  static async createForGroupMembers(groupId: string): Promise<Payment[]> {
    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    // Create payment record for each member
    const payments = await Promise.all(
      members.map((member) =>
        prisma.payment.upsert({
          where: {
            groupId_userId: {
              groupId,
              userId: member.userId,
            },
          },
          create: {
            groupId,
            userId: member.userId,
            status: PaymentStatus.UNPAID,
          },
          update: {}, // Don't update if already exists
        })
      )
    );

    return payments;
  }

  /**
   * Get all payments for a group
   */
  static async findByGroupId(groupId: string): Promise<PaymentWithUser[]> {
    return prisma.payment.findMany({
      where: { groupId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Get payment by group and user
   */
  static async findByGroupAndUser(
    groupId: string,
    userId: string
  ): Promise<Payment | null> {
    return prisma.payment.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
  }

  /**
   * Update payment status
   */
  static async updateStatus(
    groupId: string,
    userId: string,
    status: PaymentStatus,
    confirmedByOwner: boolean
  ): Promise<Payment> {
    return prisma.payment.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        status,
        confirmedByOwner,
        confirmedAt: confirmedByOwner ? new Date() : null,
      },
    });
  }

  /**
   * Check if all payments are confirmed
   */
  static async areAllPaid(groupId: string): Promise<boolean> {
    const payments = await prisma.payment.findMany({
      where: { groupId },
    });

    if (payments.length === 0) return false;

    return payments.every(
      (payment) => payment.status === PaymentStatus.PAID && payment.confirmedByOwner
    );
  }

  /**
   * Get payment statistics for a group
   */
  static async getStatistics(groupId: string): Promise<{
    total: number;
    paid: number;
    unpaid: number;
    pending: number;
    allConfirmed: boolean;
  }> {
    const payments = await prisma.payment.findMany({
      where: { groupId },
    });

    const total = payments.length;
    const paid = payments.filter((p) => p.status === PaymentStatus.PAID).length;
    const unpaid = payments.filter((p) => p.status === PaymentStatus.UNPAID).length;
    const pending = payments.filter((p) => p.status === PaymentStatus.PENDING).length;
    const allConfirmed = payments.every(
      (p) => p.status === PaymentStatus.PAID && p.confirmedByOwner
    );

    return { total, paid, unpaid, pending, allConfirmed };
  }
}
