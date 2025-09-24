import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/TagRepository";
import type { CreateTagInput, Tag } from "@/types/todo";

export async function createTagService(input: CreateTagInput): Promise<Tag> {
  return prisma.$transaction(async (tx) => {
    const tagRepo = new TagRepository(tx);

    // 同じ名前のタグが既に存在しないか確認
    const existingTag = await tagRepo.findByName(input.name);
    if (existingTag) {
      throw new Error(`Tag with name "${input.name}" already exists`);
    }

    return tagRepo.create(input);
  });
}
