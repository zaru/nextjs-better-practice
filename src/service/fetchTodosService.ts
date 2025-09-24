import { prisma } from "@/lib/prisma";
import { TodoRepository } from "@/repository/todo.repository";
import type { Todo, TodoFilter, TodoSort } from "@/types/todo";

export async function fetchTodosService(
  filter?: TodoFilter,
  sort?: TodoSort,
): Promise<Todo[]> {
  const todoRepo = new TodoRepository(prisma);
  return await todoRepo.list(filter, sort);
}
