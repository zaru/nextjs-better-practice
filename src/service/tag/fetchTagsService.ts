import { prisma } from "@/lib/prisma";
import { type Tag, tagRepository } from "@/repository/TagRepository";

export async function fetchTagsService(options?: {
  page?: number;
  take?: number;
}): Promise<{ total: number; items: Tag[] }> {
  const tagRepo = tagRepository({ tx: prisma });
  const [total, items] = await Promise.all([
    tagRepo.count(),
    tagRepo.list(options),
  ]);
  return { total, items };
}
