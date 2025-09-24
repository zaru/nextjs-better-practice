import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/tag.repository";

export async function deleteTagService(id: string): Promise<void> {
  return await prisma.$transaction(async (tx) => {
    const tagRepo = new TagRepository(tx);

    // タグの存在確認
    const existingTag = await tagRepo.find(id);
    if (!existingTag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    await tagRepo.delete(id);
  });
}
