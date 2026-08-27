import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();
const envSchema = z.object({
  PORT: z.string().default("5000"),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default("30d"),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});
export const env = envSchema.parse(process.env);
