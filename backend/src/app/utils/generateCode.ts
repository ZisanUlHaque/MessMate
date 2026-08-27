import { prisma } from "../lib/prisma";

export const generateInviteCode = async (): Promise<string> => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < 5; i++) {
    const code = Array.from(
      { length: 6 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    const exists = await prisma.mess.findUnique({
      where: { inviteCode: code },
    });
    if (!exists) return code;
  }
  throw new Error("Failed to generate unique invite code");
};
