import { prisma } from "@/lib/prisma";
import { TodoRepository } from "@/repository/TodoRepository";

export async function deleteTodoService(id: string): Promise<void> {
  return prisma.$transaction(async (tx) => {
    const todoRepo = new TodoRepository(tx);

    // TODOの存在確認
    const existingTodo = await todoRepo.find(id);
    if (!existingTodo) {
      throw new Error(`Todo with ID ${id} not found`);
    }

    await todoRepo.delete(id);
  });
}
