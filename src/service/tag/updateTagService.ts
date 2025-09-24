import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/TagRepository";
import type { Tag, UpdateTagInput } from "@/types/todo";

export async function updateTagService(
  id: string,
  input: UpdateTagInput,
): Promise<Tag> {
  return prisma.$transaction(async (tx) => {
    const tagRepo = new TagRepository(tx);

    // タグの存在確認
    const existingTag = await tagRepo.find(id);
    if (!existingTag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    // 同じ名前のタグが既に存在しないか確認（自分以外）
    const duplicateTag = await tagRepo.findByName(input.name);
    if (duplicateTag && duplicateTag.id !== id) {
      throw new Error(`Tag with name "${input.name}" already exists`);
    }

    return tagRepo.update(id, input);
  });
}
