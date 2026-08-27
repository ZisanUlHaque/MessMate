import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../lib/env";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const authService = {
  generateToken: (id: string) =>
    jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    }),
  async register(data: any) {
    const exists = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (exists) throw new AppError(409,"Phone number already exists");
    const password = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: { ...data, password },
      select: { id: true, fullName: true, phone: true, role: true },
    });
    return { token: this.generateToken(user.id), user };
  },
  async login({ phone, password }: any) {
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new AppError(401,"Invalid credentials");
    const { password: _, ...userWithoutPass } = user;
    return { token: this.generateToken(user.id), user: userWithoutPass };
  },
};
