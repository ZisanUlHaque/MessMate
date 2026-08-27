import { Request, Response } from "express";

import { checkMealDeadline } from "./meal.service";
import { catchAsync } from "../../utils/catchAsync";
import { prisma } from "../../lib/prisma";
import { sendSuccess } from "../../utils/response";
import { AppError } from "../../utils/AppError";

export const upsertMeal = catchAsync(async (req: Request, res: Response) => {
  const { messId, date, breakfast, lunch, dinner } = req.body;
  const targetDate = new Date(date);
  checkMealDeadline(targetDate);
  const meal = await prisma.meal.upsert({
    where: {
      messId_userId_date: { messId, userId: req.user!.id, date: targetDate },
    },
    update: { breakfast, lunch, dinner },
    create: {
      messId,
      userId: req.user!.id,
      date: targetDate,
      breakfast,
      lunch,
      dinner,
    },
  });
  sendSuccess(res, meal, "Meal updated");
});

export const getTodayMeals = catchAsync(async (req: Request, res: Response) => {
  const messId = req.query.messId as string;

  // Get start and end of today in local/server time properly
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const meals = await prisma.meal.findMany({
    where: {
      messId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    include: {
      user: { select: { fullName: true } },
    },
  });

  sendSuccess(res, meals);
});

export const getMyMeals = catchAsync(async (req: Request, res: Response) => {
  const { messId, month, year } = req.query as any;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const meals = await prisma.meal.findMany({
    where: { messId, userId: req.user!.id, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });
  sendSuccess(res, meals);
});
export const updateMealOwner = catchAsync(
  async (req: Request, res: Response) => {
    const meal = await prisma.meal.findUnique({
      where: { id: req.params.id as string },
    });
    if (!meal || meal.userId !== req.user!.id)
      throw new AppError(403, "Not authorized");
    if (meal.isLocked) throw new AppError(400, "Meal is locked");
    checkMealDeadline(meal.date);
    const updated = await prisma.meal.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    sendSuccess(res, updated);
  },
);
