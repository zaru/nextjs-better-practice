import { prisma } from "@/lib/prisma";
import { TodoRepository } from "@/repository/todo.repository";
import type { Todo } from "@/types/todo";

export async function fetchTodoService(id: string): Promise<Todo | null> {
  const todoRepo = new TodoRepository(prisma);
  return await todoRepo.find(id);
}
