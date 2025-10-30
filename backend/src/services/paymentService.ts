import { PaymentStatus } from '@prisma/client';
import { PaymentModel, PaymentWithUser } from '../models/Payment';
import { GroupModel } from '../models/Group';

export interface PaymentSummary {
  payments: PaymentWithUser[];
  statistics: {
    total: number;
    paid: number;
    unpaid: number;
    pending: number;
    allConfirmed: boolean;
  };
}

export class PaymentService {
  /**
   * Get payment status for a group
   */
  static async getGroupPayments(groupId: string, userId: string): Promise<PaymentSummary> {
    // Verify group exists
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Verify user is a member or owner
    const isMember = await GroupModel.isMember(groupId, userId);
    const isOwner = group.ownerId === userId;

    if (!isMember && !isOwner) {
      throw new Error('Not authorized to view payments');
    }

    // Get payments
    const payments = await PaymentModel.findByGroupId(groupId);

    // Get statistics
    const statistics = await PaymentModel.getStatistics(groupId);

    return { payments, statistics };
  }

  /**
   * Update payment status (owner only)
   */
  static async updatePaymentStatus(
    groupId: string,
    targetUserId: string,
    ownerId: string,
    status: 'PAID' | 'UNPAID' | 'PENDING'
  ): Promise<PaymentWithUser> {
    // Verify group exists and is closed
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (!group.isClosed) {
      throw new Error('Can only update payments for closed groups');
    }

    // Verify user is the owner
    if (group.ownerId !== ownerId) {
      throw new Error('Only group owner can update payment status');
    }

    // Verify target user is a member
    const isMember = await GroupModel.isMember(groupId, targetUserId);
    if (!isMember) {
      throw new Error('User is not a member of this group');
    }

    // Update payment status
    const payment = await PaymentModel.updateStatus(
      groupId,
      targetUserId,
      status as PaymentStatus,
      true // confirmedByOwner
    );

    // Get updated payment with user details
    const payments = await PaymentModel.findByGroupId(groupId);
    const updatedPayment = payments.find((p) => p.userId === targetUserId);

    if (!updatedPayment) {
      throw new Error('Failed to retrieve updated payment');
    }

    return updatedPayment;
  }

  /**
   * Mark own payment as pending (member self-reporting)
   */
  static async markAsPending(groupId: string, userId: string): Promise<PaymentWithUser> {
    // Verify group exists and is closed
    const group = await GroupModel.findById(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    if (!group.isClosed) {
      throw new Error('Can only update payments for closed groups');
    }

    // Verify user is a member
    const isMember = await GroupModel.isMember(groupId, userId);
    if (!isMember) {
      throw new Error('Not a member of this group');
    }

    // Update to pending (not confirmed by owner yet)
    const payment = await PaymentModel.updateStatus(
      groupId,
      userId,
      PaymentStatus.PENDING,
      false // not confirmed by owner
    );

    // Get updated payment with user details
    const payments = await PaymentModel.findByGroupId(groupId);
    const updatedPayment = payments.find((p) => p.userId === userId);

    if (!updatedPayment) {
      throw new Error('Failed to retrieve updated payment');
    }

    return updatedPayment;
  }

  /**
   * Initialize payments when group closes
   */
  static async initializePayments(groupId: string): Promise<void> {
    await PaymentModel.createForGroupMembers(groupId);
  }

  /**
   * Check if group can be deleted (all payments confirmed)
   */
  static async canDeleteGroup(groupId: string): Promise<boolean> {
    return PaymentModel.areAllPaid(groupId);
  }
}
