import { prisma } from "@/lib/prisma";
import { type Tag, TagRepository } from "@/repository/TagRepository";

export async function fetchTagsService(): Promise<Tag[]> {
  const tagRepo = new TagRepository(prisma);
  return tagRepo.list();
}
