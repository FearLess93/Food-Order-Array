import { Group, GroupStatus, GroupMember, User, Restaurant } from '@prisma/client';
import prisma from '../config/database';

export type GroupWithRelations = Group & {
  owner: User;
  restaurant: Restaurant;
  members: (GroupMember & { user: User })[];
  _count: {
    members: number;
  };
};

export type GroupCreateInput = {
  ownerId: string;
  restaurantId: string;
  name: string;
  status: GroupStatus;
  joinCode?: string;
  endAt: Date;
  maxMembers?: number;
};

export class GroupModel {
  /**
   * Create a new group
   */
  static async create(data: GroupCreateInput): Promise<Group> {
    return prisma.group.create({
      data,
    });
  }

  /**
   * Find group by ID
   */
  static async findById(id: string): Promise<Group | null> {
    return prisma.group.findUnique({
      where: { id },
    });
  }

  /**
   * Find group by ID with all relations
   */
  static async findByIdWithRelations(id: string): Promise<GroupWithRelations | null> {
    return prisma.group.findUnique({
      where: { id },
      include: {
        owner: true,
        restaurant: true,
        members: {
          include: { user: true },
          orderBy: { joinedAt: 'asc' },
        },
        _count: {
          select: { members: true },
        },
      },
    });
  }

  /**
   * Find group by join code
   */
  static async findByJoinCode(joinCode: string): Promise<Group | null> {
    return prisma.group.findUnique({
      where: { joinCode },
    });
  }

  /**
   * Get all groups with filters
   */
  static async findAll(filters?: {
    status?: GroupStatus;
    isClosed?: boolean;
    ownerId?: string;
    userId?: string; // Groups where user is a member
    search?: string;
  }): Promise<GroupWithRelations[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isClosed !== undefined) {
      where.isClosed = filters.isClosed;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.userId) {
      where.members = {
        some: {
          userId: filters.userId,
        },
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { restaurant: { name: { contains: filters.search, mode: 'insensitive' } } },
        { owner: { name: { contains: filters.search, mode: 'insensitive' } } },
      ];
    }

    return prisma.group.findMany({
      where,
      include: {
        owner: true,
        restaurant: true,
        members: {
          include: { user: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update group
   */
  static async update(
    id: string,
    data: {
      name?: string;
      isClosed?: boolean;
      endAt?: Date;
    }
  ): Promise<Group> {
    return prisma.group.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete group
   */
  static async delete(id: string): Promise<Group> {
    return prisma.group.delete({
      where: { id },
    });
  }

  /**
   * Close expired groups
   */
  static async closeExpiredGroups(): Promise<number> {
    const result = await prisma.group.updateMany({
      where: {
        endAt: {
          lte: new Date(),
        },
        isClosed: false,
      },
      data: {
        isClosed: true,
      },
    });
    return result.count;
  }

  /**
   * Check if user is a member of the group
   */
  static async isMember(groupId: string, userId: string): Promise<boolean> {
    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    });
    return !!member;
  }

  /**
   * Add member to group
   */
  static async addMember(groupId: string, userId: string): Promise<GroupMember> {
    return prisma.groupMember.create({
      data: {
        groupId,
        userId,
      },
    });
  }

  /**
   * Get member count
   */
  static async getMemberCount(groupId: string): Promise<number> {
    return prisma.groupMember.count({
      where: { groupId },
    });
  }
}
