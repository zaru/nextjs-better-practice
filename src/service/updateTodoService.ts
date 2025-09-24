import { prisma } from "@/lib/prisma";
import { TagRepository } from "@/repository/tag.repository";
import { TodoRepository } from "@/repository/todo.repository";
import type { Todo, UpdateTodoInput } from "@/types/todo";

export async function updateTodoService(
  id: string,
  input: UpdateTodoInput,
): Promise<Todo> {
  return await prisma.$transaction(async (tx) => {
    const todoRepo = new TodoRepository(tx);
    const tagRepo = new TagRepository(tx);

    // TODOの存在確認
    const existingTodo = await todoRepo.find(id);
    if (!existingTodo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    // タグIDが指定されている場合、存在確認
    if (input.tagIds && input.tagIds.length > 0) {
      for (const tagId of input.tagIds) {
        const tag = await tagRepo.find(tagId);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
      }
    }

    return await todoRepo.update(id, input);
  });
}
