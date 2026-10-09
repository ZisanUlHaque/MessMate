import { z } from "zod";

export const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Enter valid BD phone (01XXXXXXXXX)"),
  password: z.string().min(6, "Minimum 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, "Name too short").max(50, "Name too long"),
    phone: z
      .string()
      .regex(/^01[3-9]\d{8}$/, "Enter valid BD phone (01XXXXXXXXX)"),
    password: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const messSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  address: z.string().max(200).optional().or(z.literal("")),
});

export type MessFormValues = z.infer<typeof messSchema>;

export const bazarSchema = z.object({
  date: z.string().min(1, "Date required"),
  totalAmount: z
    .string()
    .min(1, "Amount required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  category: z.enum(["GROCERY", "GAS", "UTILITY", "OTHER"]),
  description: z.string().max(500).optional(),
});

export type BazarFormValues = z.infer<typeof bazarSchema>;

export const paymentSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount required")
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "Must be > 0"),
  method: z.enum(["CASH", "BKASH", "BANK"]),
  note: z.string().max(200).optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const joinMessSchema = z.object({
  inviteCode: z
    .string()
    .length(6, "Code must be 6 characters")
    .regex(/^[A-Z0-9]+$/, "Uppercase letters and numbers only"),
});

export type JoinMessFormValues = z.infer<typeof joinMessSchema>;

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, "Minimum 6 characters"),
    newPassword: z.string().min(6, "Minimum 6 characters"),
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
