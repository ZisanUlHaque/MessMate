import { Request, Response } from "express";

import { calculateMonthlyBill } from "./bill.service";
import { catchAsync } from "../../utils/catchAsync";
import { sendCreated, sendSuccess } from "../../utils/response";
import { prisma } from "../../lib/prisma";

export const generateBill = catchAsync(async (req: Request, res: Response) => {
  const { messId, month, year } = req.body;
  const bills = await calculateMonthlyBill(
    messId,
    parseInt(month),
    parseInt(year),
  );
  sendCreated(res, bills, "Bills generated successfully");
});
export const getMyBill = catchAsync(async (req: Request, res: Response) => {
  const { messId, month, year } = req.query as any;
  const bill = await prisma.bill.findUnique({
    where: {
      messId_userId_month_year: {
        messId,
        userId: req.user!.id,
        month: parseInt(month),
        year: parseInt(year),
      },
    },
    include: { payments: true },
  });
  sendSuccess(res, bill);
});
export const payBill = catchAsync(async (req: Request, res: Response) => {
  const { amount, method, note } = req.body;
  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        billId: String(req.params.id),
        userId: req.user!.id,
        amount,
        method,
        note,
      },
    });
    const billId = String(req.params.id);
    const bill = await tx.bill.findUnique({ where: { id: billId } });
    const newPaid = Number(bill!.paidAmount) + Number(amount);
    const newDue = Number(bill!.totalAmount) - newPaid;
    const status = newDue <= 0 ? "PAID" : "PARTIAL";
    await tx.bill.update({
      where: { id: bill!.id },
      data: { paidAmount: newPaid, dueAmount: newDue, status },
    });
    return payment;
  });
  sendCreated(res, result, "Payment recorded");
});
