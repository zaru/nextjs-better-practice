import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/tag.repository";
import type { Tag } from "@/types/todo";

export async function fetchTagsService(): Promise<Tag[]> {
  const tagRepo = new TagRepository(prisma);
  return await tagRepo.list();
}
