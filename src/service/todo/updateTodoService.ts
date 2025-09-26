import { prisma } from "@/lib/prisma";
import { tagRepository } from "@/repository/TagRepository";
import {
  type Todo,
  type TodoWithTags,
  todoRepository,
} from "@/repository/TodoRepository";

interface Params {
  id: string;
  content: string;
  status?: Todo["status"];
  dueDate?: Date;
  tagIds?: string[];
}
export async function updateTodoService({
  id,
  content,
  status,
  dueDate,
  tagIds,
}: Params): Promise<TodoWithTags> {
  return prisma.$transaction(async (tx) => {
    const todoRepo = todoRepository({ tx });
    const tagRepo = tagRepository({ tx });

    // TODOの存在確認
    const existingTodo = await todoRepo.find(id);
    if (!existingTodo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    // タグIDが指定されている場合、存在確認
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        const tag = await tagRepo.find(tagId);
        if (!tag) {
          throw new Error(`Tag with ID ${tagId} not found`);
        }
      }
    }

    return todoRepo.update(id, {
      content,
      status,
      dueDate,
      tagIds,
    });
  });
}
