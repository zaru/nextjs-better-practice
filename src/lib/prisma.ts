import { PrismaClient } from "@/generated/prisma";

export type PrismaTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
