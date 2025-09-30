import type { Prisma, PrismaClient } from "@/generated/prisma";
import type { PrismaTransaction } from "@/lib/prisma";

export const tagSelect = {
  id: true,
  name: true,
} satisfies Prisma.TagSelect;

export type Tag = Prisma.TagGetPayload<{ select: typeof tagSelect }>;

export const tagRepository = ({
  tx,
}: {
  tx: PrismaClient | PrismaTransaction;
}) => ({
  list: async (options?: { page?: number; take?: number }): Promise<Tag[]> => {
    return tx.tag.findMany({
      select: tagSelect,
      orderBy: {
        name: "asc",
      },
      skip:
        options?.page && options?.take
          ? (options.page - 1) * options.take
          : undefined,
      take: options?.take,
    });
  },

  count: async (): Promise<number> => {
    return tx.tag.count();
  },

  find: async (id: string): Promise<Tag | null> => {
    return tx.tag.findUnique({
      select: tagSelect,
      where: { id },
    });
  },

  findByName: async (name: string): Promise<Tag | null> => {
    return tx.tag.findUnique({
      select: tagSelect,
      where: { name },
    });
  },

  create: async (input: Pick<Prisma.TagCreateInput, "name">): Promise<Tag> => {
    return tx.tag.create({
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  },

  update: async (
    id: string,
    input: Pick<Prisma.TagCreateInput, "name">,
  ): Promise<Tag> => {
    return tx.tag.update({
      where: { id },
      data: {
        name: input.name,
      },
      select: tagSelect,
    });
  },

  delete: async (id: string): Promise<void> => {
    await tx.tag.delete({
      where: { id },
    });
  },
});
