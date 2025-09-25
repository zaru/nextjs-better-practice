import { prisma } from "@/lib/prisma";
import { type Tag, TagRepository } from "@/repository/TagRepository";

interface Params {
  id: string;
  name: string;
}

export async function updateTagService({ id, name }: Params): Promise<Tag> {
  return prisma.$transaction(async (tx) => {
    const tagRepo = new TagRepository(tx);

    // タグの存在確認
    const existingTag = await tagRepo.find(id);
    if (!existingTag) {
      throw new Error(`Tag with ID ${id} not found`);
    }

    // 同じ名前のタグが既に存在しないか確認（自分以外）
    const duplicateTag = await tagRepo.findByName(name);
    if (duplicateTag && duplicateTag.id !== id) {
      throw new Error(`Tag with name "${name}" already exists`);
    }

    return tagRepo.update(id, { name });
  });
}
