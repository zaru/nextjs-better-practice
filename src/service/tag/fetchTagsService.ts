import { prisma } from "@/lib/prisma";
import { type Tag, tagRepository } from "@/repository/TagRepository";

export async function fetchTagsService(): Promise<Tag[]> {
  const tagRepo = tagRepository({ tx: prisma });
  return tagRepo.list();
}
