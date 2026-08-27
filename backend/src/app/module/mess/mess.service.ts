import {
  MemberStatus,
  Prisma,
  UserRole,
} from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { generateInviteCode } from "../../utils/generateCode";

export const messService = {
  async createMess(userId: string, payload: Prisma.MessUncheckedCreateInput) {
    const inviteCode = await generateInviteCode();

    return prisma.$transaction(async (tx) => {
      const mess = await tx.mess.create({
        data: {
          ...payload,
          managerId: userId,
          inviteCode,
        },
      });

      await tx.messMember.create({
        data: {
          messId: mess.id,
          userId,
          role: UserRole.MANAGER,
          status: MemberStatus.APPROVED,
        },
      });

      return mess;
    });
  },

  /**
   * Get all messes where the user is an APPROVED member.
   */
  async getMyMesses(userId: string) {
    const memberships = await prisma.messMember.findMany({
      where: { userId, status: MemberStatus.APPROVED },
      include: { mess: true },
    });
    return memberships.map((m) => m.mess);
  },

  /**
   * Get detailed information about a specific mess, including its members.
   */
  async getMessDetails(messId: string) {
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                phone: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!mess) throw new AppError(404, "Mess not found");
    return mess;
  },

  /**
   * Update mess settings (e.g., gas bill, utility bill, address).
   */
  async updateMess(messId: string, payload: Prisma.MessUpdateInput) {
    return prisma.mess.update({
      where: { id: messId },
      data: payload,
    });
  },

  /**
   * Submit a request to join a mess via a 6-digit invite code.
   */
  async joinMess(userId: string, inviteCode: string) {
    const mess = await prisma.mess.findUnique({ where: { inviteCode } });
    if (!mess) throw new AppError(404, "Invalid invite code");

    const exists = await prisma.messMember.findUnique({
      where: { messId_userId: { messId: mess.id, userId } },
    });

    if (exists) {
      throw new AppError(
        409,
        "You are already a member or have a pending request",
      );
    }

    return prisma.messMember.create({
      data: {
        messId: mess.id,
        userId,
        status: MemberStatus.PENDING,
      },
    });
  },

  /**
   * Approve or reject a pending member (Manager only).
   */
  async manageMember(messId: string, userId: string, status: MemberStatus) {
    return prisma.messMember.update({
      where: { messId_userId: { messId, userId } },
      data: { status },
    });
  },

  /**
   * Remove a member from the mess (Manager only).
   */
  async removeMember(
    messId: string,
    targetUserId: string,
    requesterId: string,
  ) {
    if (targetUserId === requesterId) {
      throw new AppError(400, "Manager cannot remove themselves");
    }

    return prisma.messMember.delete({
      where: { messId_userId: { messId, userId: targetUserId } },
    });
  },
};
