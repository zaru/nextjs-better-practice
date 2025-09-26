import { prisma } from "@/lib/prisma";
import { todoRepository } from "@/repository/TodoRepository";

interface Params {
  id: string;
}

export async function deleteTodoService({ id }: Params): Promise<void> {
  return prisma.$transaction(async (tx) => {
    const todoRepo = todoRepository({ tx });

    // TODOの存在確認
    const existingTodo = await todoRepo.find(id);
    if (!existingTodo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    await todoRepo.delete(id);
  });
}
