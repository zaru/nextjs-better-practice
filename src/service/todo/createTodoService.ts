import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/TagRepository";
import { TodoRepository } from "@/repository/TodoRepository";
import type { CreateTodoInput, Todo } from "@/types/todo";

export async function createTodoService(input: CreateTodoInput): Promise<Todo> {
  return prisma.$transaction(async (tx) => {
    const todoRepo = new TodoRepository(tx);
    const tagRepo = new TagRepository(tx);

    // タグIDが指定されている場合、存在確認
    if (input.tagIds && input.tagIds.length > 0) {
      for (const tagId of input.tagIds) {
        const tag = await tagRepo.find(tagId);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
      }
    }

    return todoRepo.create(input);
  });
}
