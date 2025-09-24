import type { PrismaClient } from "@/generated/prisma";
import type { prisma } from "@/lib/prisma";
import type { CreateTagInput, Tag, UpdateTagInput } from "@/types/todo";

type PrismaTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export class TagRepository {
  constructor(private readonly tx: PrismaClient | PrismaTransaction) {}

  async list(): Promise<Tag[]> {
    return this.tx.tag.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async find(id: string): Promise<Tag | null> {
    return this.tx.tag.findUnique({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id },
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tx.tag.findUnique({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { name },
    });
  }

  async create(input: CreateTagInput): Promise<Tag> {
    return this.tx.tag.create({
      data: {
        name: input.name,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, input: UpdateTagInput): Promise<Tag> {
    return this.tx.tag.update({
      where: { id },
      data: {
        name: input.name,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.tx.tag.delete({
      where: { id },
    });
  }
}
