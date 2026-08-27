import { Request, Response } from "express";
import { authService } from "./auth.service";

import bcrypt from "bcryptjs";
import { catchAsync } from "../../utils/catchAsync";
import { sendCreated, sendSuccess } from "../../utils/response";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendCreated(res, result, "Registered successfully");
});
export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, result, "Logged in successfully");
});
export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      fullName: true,
      phone: true,
      role: true,
      profileImage: true,
      expoPushToken: true,
    },
  });
  sendSuccess(res, user);
});
export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
    select: {
      id: true,
      fullName: true,
      phone: true,
      role: true,
      profileImage: true,
      expoPushToken: true,
    },
  });
  sendSuccess(res, user, "Profile updated");
});
export const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user || !(await bcrypt.compare(req.body.oldPassword, user.password)))
      throw new AppError(401, "Incorrect old password");
    const newPassword = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: newPassword },
    });
    sendSuccess(res, null, "Password updated");
  },
);
