import { Group, GroupStatus } from '@prisma/client';
import { GroupModel, GroupWithRelations, GroupCreateInput } from '../models/Group';
import { RestaurantModel } from '../models/Restaurant';
import { generateJoinCode, isValidJoinCodeFormat } from '../utils/joinCode';

export interface CreateGroupInput {
  ownerId: string;
  restaurantId: string;
  name: string;
  status: 'PUBLIC' | 'PRIVATE';
  durationMinutes: number; // Duration in minutes
  maxMembers?: number;
}

export class GroupService {
  /**
   * Create a new group
   */
  static async createGroup(input: CreateGroupInput): Promise<GroupWithRelations> {
    const { ownerId, restaurantId, name, status, durationMinutes, maxMembers } = input;

    // Validate restaurant exists
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Validate duration (15 minutes to 24 hours)
    if (durationMinutes < 15 || durationMinutes > 1440) {
      throw new Error('Duration must be between 15 minutes and 24 hours');
    }

    // Calculate end time
    const endAt = new Date();
    endAt.setMinutes(endAt.getMinutes() + durationMinutes);

    // Generate join code for private groups
    let joinCode: string | undefined;
    if (status === 'PRIVATE') {
      joinCode = generateJoinCode();
      
      // Ensure join code is unique
      let attempts = 0;
      while (await GroupModel.findByJoinCode(joinCode)) {
        joinCode = generateJoinCode();
        attempts++;
        if (attempts > 10) {
          throw new Error('Failed to generate unique join code');
        }
      }
    }

    // Create group
    const groupData: GroupCreateInput = {
      ownerId,
      restaurantId,
      name,
      status: status as GroupStatus,
      joinCode,
      endAt,
      maxMembers,
    };

    const group = await GroupModel.create(groupData);

    // Automatically add owner as first member
    await GroupModel.addMember(group.id, ownerId);

    // Return group with relations
    const groupWithRelations = await GroupModel.findByIdWithRelations(group.id);
    if (!groupWithRelations) {
      throw new Error('Failed to retrieve created group');
    }

    return groupWithRelations;
  }

  /**
   * Get all groups with filters
   */
  static async getGroups(filters?: {
    status?: 'PUBLIC' | 'PRIVATE';
    myGroups?: boolean;
    userId?: string;
    search?: string;
  }): Promise<GroupWithRelations[]> {
    const queryFilters: any = {};

    if (filters?.status) {
      queryFilters.status = filters.status as GroupStatus;
    }

    // Show only open groups by default
    queryFilters.isClosed = false;

    if (filters?.myGroups && filters?.userId) {
      queryFilters.userId = filters.userId;
    }

    if (filters?.search) {
      queryFilters.search = filters.search;
    }

    // For public groups, don't show private groups unless user is a member
    if (!filters?.myGroups) {
      queryFilters.status = GroupStatus.PUBLIC;
    }

    return GroupModel.findAll(queryFilters);
  }

  /**
   * Get group by ID
   */
  static async getGroupById(id: string, userId?: string): Promise<GroupWithRelations> {
    const group = await GroupModel.findByIdWithRelations(id);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Check if user has access to private group
    if (group.status === GroupStatus.PRIVATE && userId) {
      const isMember = await GroupModel.isMember(id, userId);
      const isOwner = group.ownerId === userId;
      
      if (!isMember && !isOwner) {
        throw new Error('Access denied to private group');
      }
    }

    return group;
  }

  /**
   * Join a group
   */
  static async joinGroup(
    groupId: string,
    userId: string,
    joinCode?: string
  ): Promise<GroupWithRelations> {
    const group = await GroupModel.findById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Check if group is closed
    if (group.isClosed) {
      throw new Error('Group is closed');
    }

    // Check if group has expired
    if (group.endAt < new Date()) {
      // Auto-close expired group
      await GroupModel.update(groupId, { isClosed: true });
      throw new Error('Group has expired');
    }

    // Check if user is already a member
    const isAlreadyMember = await GroupModel.isMember(groupId, userId);
    if (isAlreadyMember) {
      throw new Error('Already a member of this group');
    }

    // Validate join code for private groups
    if (group.status === GroupStatus.PRIVATE) {
      if (!joinCode) {
        throw new Error('Join code required for private group');
      }
      
      if (!isValidJoinCodeFormat(joinCode)) {
        throw new Error('Invalid join code format');
      }

      if (group.joinCode !== joinCode) {
        throw new Error('Invalid join code');
      }
    }

    // Check max members limit
    if (group.maxMembers) {
      const memberCount = await GroupModel.getMemberCount(groupId);
      if (memberCount >= group.maxMembers) {
        throw new Error('Group is full');
      }
    }

    // Add user to group
    await GroupModel.addMember(groupId, userId);

    // Return updated group
    const updatedGroup = await GroupModel.findByIdWithRelations(groupId);
    if (!updatedGroup) {
      throw new Error('Failed to retrieve updated group');
    }

    return updatedGroup;
  }

  /**
   * Delete a group (owner only, all payments confirmed)
   */
  static async deleteGroup(groupId: string, userId: string): Promise<void> {
    const { PaymentService } = await import('./paymentService');
    
    const group = await GroupModel.findByIdWithRelations(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Check if user is the owner
    if (group.ownerId !== userId) {
      throw new Error('Only group owner can delete the group');
    }

    // Check if group is closed
    if (!group.isClosed) {
      throw new Error('Cannot delete group that is still open');
    }

    // Check if all payments are confirmed
    const canDelete = await PaymentService.canDeleteGroup(groupId);
    if (!canDelete) {
      throw new Error('Cannot delete group until all payments are confirmed');
    }

    await GroupModel.delete(groupId);
  }

  /**
   * Close expired groups (background job)
   */
  static async closeExpiredGroups(): Promise<number> {
    const { PaymentService } = await import('./paymentService');
    
    // Get expired groups that are not closed
    const expiredGroups = await GroupModel.findAll({
      isClosed: false,
    });

    const now = new Date();
    const groupsToClose = expiredGroups.filter((group) => group.endAt <= now);

    // Close each group and initialize payments
    for (const group of groupsToClose) {
      await GroupModel.update(group.id, { isClosed: true });
      await PaymentService.initializePayments(group.id);
    }

    return groupsToClose.length;
  }
}
