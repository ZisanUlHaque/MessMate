import { z } from "zod";
export const registerSchema = z.object({
  fullName: z.string().min(2).max(50),
  phone: z.string().min(10).max(15),
  password: z.string().min(6),
});
export const loginSchema = z.object({
  phone: z.string(),
  password: z.string(),
});
export const updateMeSchema = z.object({
  fullName: z.string().optional(),
  phone: z.string().optional(),
  expoPushToken: z.string().optional(),
});
export const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6),
});
