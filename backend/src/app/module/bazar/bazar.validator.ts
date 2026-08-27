import { z } from "zod";
import { BazarCategory } from "../../../generated/prisma/enums";
export const bazarSchema = z.object({
  messId: z.string(),
  date: z.string(),
  totalAmount: z.number().min(0),
  category: z.nativeEnum(BazarCategory).default(BazarCategory.GROCERY),
  description: z.string().optional(),
  items: z
    .array(
      z.object({
        itemName: z.string(),
        quantity: z.number(),
        unit: z.string(),
        unitPrice: z.number(),
        totalPrice: z.number(),
      }),
    )
    .optional(),
});
