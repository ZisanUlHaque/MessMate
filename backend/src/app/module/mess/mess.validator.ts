import { z } from "zod";
export const createMessSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().max(200).optional(),
});
export const updateMessSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  address: z.string().optional(),
  monthlyGasBill: z.number().min(0).optional(),
  monthlyUtilityBill: z.number().min(0).optional(),
});
export const joinMessSchema = z.object({ inviteCode: z.string().length(6) });
