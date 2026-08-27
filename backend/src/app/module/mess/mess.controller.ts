import { Request, Response } from "express";

import { messService } from "./mess.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendCreated, sendSuccess } from "../../utils/response";
import { MemberStatus } from "../../../generated/prisma/enums";

const getSingleParam = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] : value ?? "";

export const createMess = catchAsync(async (req: Request, res: Response) => {
  const result = await messService.createMess(req.user!.id, req.body);
  sendCreated(res, result, "Mess created successfully");
});

export const getMyMesses = catchAsync(async (req: Request, res: Response) => {
  const result = await messService.getMyMesses(req.user!.id);
  sendSuccess(res, result);
});

export const getMessDetails = catchAsync(
  async (req: Request, res: Response) => {
    const messId = getSingleParam(req.params.id);
    const result = await messService.getMessDetails(messId);
    sendSuccess(res, result);
  },
);

export const updateMess = catchAsync(async (req: Request, res: Response) => {
  const messId = getSingleParam(req.params.id);
  const result = await messService.updateMess(messId, req.body);
  sendSuccess(res, result, "Mess updated successfully");
});

export const joinMess = catchAsync(async (req: Request, res: Response) => {
  const result = await messService.joinMess(req.user!.id, req.body.inviteCode);
  sendCreated(res, result, "Join request sent successfully");
});

export const manageMember = catchAsync(async (req: Request, res: Response) => {
  const status = req.path.includes("approve")
    ? MemberStatus.APPROVED
    : MemberStatus.REJECTED;
  const messId = getSingleParam(req.params.id);
  const userId = getSingleParam(req.params.userId);

  const result = await messService.manageMember(messId, userId, status);
  sendSuccess(res, result, `Member ${status.toLowerCase()} successfully`);
});

export const removeMember = catchAsync(async (req: Request, res: Response) => {
  const messId = getSingleParam(req.params.id);
  const userId = getSingleParam(req.params.userId);

  await messService.removeMember(messId, userId, req.user!.id);
  sendSuccess(res, null, "Member removed successfully");
});
