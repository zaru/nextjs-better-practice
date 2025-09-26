import { prisma } from "@/lib/prisma";
import { tagRepository } from "@/repository/TagRepository";
import { type Todo, todoRepository } from "@/repository/TodoRepository";

interface Params {
  content: string;
  status?: Todo["status"];
  dueDate?: Date;
  tagIds?: string[];
}

export async function createTodoService({
  content,
  status,
  dueDate,
  tagIds,
}: Params): Promise<Todo> {
  return prisma.$transaction(async (tx) => {
    const todoRepo = todoRepository({ tx });
    const tagRepo = tagRepository({ tx });

    // TODO: N+1問題の解消
    // タグIDが指定されている場合、存在確認
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        const tag = await tagRepo.find(tagId);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
      }
    }

    return todoRepo.create({
      content,
      status,
      dueDate,
      tagIds,
    });
  });
}
