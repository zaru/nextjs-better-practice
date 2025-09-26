import { prisma } from "@/lib/prisma";
import { tagRepository } from "@/repository/TagRepository";

interface Params {
  id: string;
}
export async function deleteTagService({ id }: Params): Promise<void> {
  return prisma.$transaction(async (tx) => {
    const tagRepo = tagRepository({ tx });

    // タグの存在確認
    const existingTag = await tagRepo.find(id);
    if (!existingTag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    await tagRepo.delete(id);
  });
}
