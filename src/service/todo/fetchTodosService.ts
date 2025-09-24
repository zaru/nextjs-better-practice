import { prisma } from "@/lib/prisma";
import { TodoRepository } from "@/repository/TodoRepository";
import type { Todo, TodoFilter, TodoSort } from "@/types/todo";

export async function fetchTodosService(
  filter?: TodoFilter,
  sort?: TodoSort,
): Promise<Todo[]> {
  const todoRepo = new TodoRepository(prisma);
  return todoRepo.list(filter, sort);
}
