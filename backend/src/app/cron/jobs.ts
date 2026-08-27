import cron from "node-cron";
import { prisma } from "../lib/prisma";
import { calculateMonthlyBill } from "../module/bill/bill.service";

export const startCronJobs = () => {
  cron.schedule("0 22 * * *", async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.meal.updateMany({
      where: { date: today, isLocked: false },
      data: { isLocked: true },
    });
    console.log("🔒 Daily meals locked at 10 PM");
  });

  cron.schedule("5 0 1 * *", async () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const messes = await prisma.mess.findMany({ where: { isActive: true } });
    for (const mess of messes) {
      try {
        await calculateMonthlyBill(mess.id, month, year);
      } catch (e) {
        console.error(`Failed billing for mess ${mess.id}:`, e);
      }
    }
    console.log(`🧾 Monthly bills generated for ${month}/${year}`);
  });
};
