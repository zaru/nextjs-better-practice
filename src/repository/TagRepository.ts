import type { Prisma, PrismaClient } from "@/generated/prisma";
import type { PrismaTransaction } from "@/lib/prisma";

export const tagSelect = {
  id: true,
  name: true,
} satisfies Prisma.TagSelect;

export type Tag = Prisma.TagGetPayload<{ select: typeof tagSelect }>;

export class TagRepository {
  constructor(private readonly tx: PrismaClient | PrismaTransaction) {}

  async list(): Promise<Tag[]> {
    return this.tx.tag.findMany({
      select: tagSelect,
      orderBy: {
        name: "asc",
      },
    });
  }

  async find(id: string): Promise<Tag | null> {
    return this.tx.tag.findUnique({
      select: tagSelect,
      where: { id },
    });
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tx.tag.findUnique({
      select: tagSelect,
      where: { name },
    });
  }

  async create(input: Pick<Prisma.TagCreateInput, "name">): Promise<Tag> {
    return this.tx.tag.create({
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  }

  async update(
    id: string,
    input: Pick<Prisma.TagCreateInput, "name">,
  ): Promise<Tag> {
    return this.tx.tag.update({
      where: { id },
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  }

  async delete(id: string) {
    await this.tx.tag.delete({
      where: { id },
    });
  }
}
