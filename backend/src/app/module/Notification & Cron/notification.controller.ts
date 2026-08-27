import { Request, Response } from "express";
import { getPaginationMeta, parsePagination } from "../../utils/pagination";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { sendPaginated, sendSuccess } from "../../utils/response";

export const getMyNotifications = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {
      userId: req.user!.id,
      isRead: req.query.isRead === "false" ? false : undefined,
    };
    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.notification.count({ where }),
    ]);
    sendPaginated(res, data, getPaginationMeta(total, page, limit));
  },
);
export const markRead = catchAsync(async (req: Request, res: Response) => {
  await prisma.notification.update({
    where: {
      id: Array.isArray(req.params.id) ? req.params.id[0] : req.params.id,
    },
    data: { isRead: true },
  });
  sendSuccess(res, null, "Marked as read");
});
