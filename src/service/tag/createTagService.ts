import { prisma } from "@/lib/prisma";
import { type Tag, tagRepository } from "@/repository/TagRepository";

interface Params {
  name: string;
}

export async function createTagService(params: Params): Promise<Tag> {
  return prisma.$transaction(async (tx) => {
    const tagRepo = tagRepository({ tx });

    // 同じ名前のタグが既に存在しないか確認
    const existingTag = await tagRepo.findByName(params.name);
    if (existingTag) {
      throw new Error(`Tag with name "${params.name}" already exists`);
    }

    return tagRepo.create(params);
  });
}
