import { z } from "zod";
export const mealSchema = z.object({
  messId: z.string(),
  date: z.string(),
  breakfast: z.boolean().default(false),
  lunch: z.boolean().default(false),
  dinner: z.boolean().default(false),
});
export const updateMealSchema = z.object({
  breakfast: z.boolean().optional(),
  lunch: z.boolean().optional(),
  dinner: z.boolean().optional(),
});
