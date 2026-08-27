import { Prisma } from "../../../generated/prisma/client";
import { BillStatus, MemberStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";


export const calculateMonthlyBill = async (
  messId: string,
  month: number,
  year: number,
) => {
  const members = await prisma.messMember.findMany({
    where: { messId, status: MemberStatus.APPROVED },
  });
  if (!members.length) throw new AppError(400,"No approved members");
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);

  const totalBazar = await prisma.bazar.aggregate({
    where: { messId, date: { gte: start, lte: end } },
    _sum: { totalAmount: true },
  });
  const totalExpense = totalBazar._sum.totalAmount || new Prisma.Decimal(0);

  const rawMeals: any =
    await prisma.$queryRaw`SELECT SUM(CASE WHEN breakfast THEN 1 ELSE 0 END + CASE WHEN lunch THEN 1 ELSE 0 END + CASE WHEN dinner THEN 1 ELSE 0 END) as total FROM meals WHERE "messId" = ${messId} AND date >= ${start} AND date <= ${end}`;
  const totalMeals = Number(rawMeals[0]?.total || 0);

  const mealRate = totalMeals > 0 ? Number(totalExpense) / totalMeals : 0;
  const mess = await prisma.mess.findUnique({ where: { id: messId } });
  const fixedCostPerMember =
    (Number(mess!.monthlyGasBill) + Number(mess!.monthlyUtilityBill)) /
    members.length;

  const generatedBills = await prisma.$transaction(async (tx) => {
    return Promise.all(
      members.map(async (m) => {
        const userMealsRaw: any =
          await tx.$queryRaw`SELECT SUM(CASE WHEN breakfast THEN 1 ELSE 0 END + CASE WHEN lunch THEN 1 ELSE 0 END + CASE WHEN dinner THEN 1 ELSE 0 END) as total FROM meals WHERE "messId" = ${messId} AND "userId" = ${m.userId} AND date >= ${start} AND date <= ${end}`;
        const userTotalMeals = Number(userMealsRaw[0]?.total || 0);
        const bazarShare = userTotalMeals * mealRate;
        const totalAmount = bazarShare + fixedCostPerMember;

        const existing = await tx.bill.findUnique({
          where: {
            messId_userId_month_year: { messId, userId: m.userId, month, year },
          },
        });
        const paid = Number(existing?.paidAmount || 0);
        const due = totalAmount - paid;
        const status =
          due <= 0
            ? BillStatus.PAID
            : paid > 0
              ? BillStatus.PARTIAL
              : BillStatus.UNPAID;

        return tx.bill.upsert({
          where: {
            messId_userId_month_year: { messId, userId: m.userId, month, year },
          },
          update: {
            totalMeals: userTotalMeals,
            mealRate,
            totalBazarShare: bazarShare,
            fixedCostShare: fixedCostPerMember,
            totalAmount,
            dueAmount: due,
            status,
          },
          create: {
            messId,
            userId: m.userId,
            month,
            year,
            totalMeals: userTotalMeals,
            mealRate,
            totalBazarShare: bazarShare,
            fixedCostShare: fixedCostPerMember,
            totalAmount,
            dueAmount: due,
            paidAmount: 0,
            status,
          },
        });
      }),
    );
  });
  return generatedBills;
};
