import { prisma } from "@/lib/prisma";
import {
  type TodoListFilter,
  type TodoListSort,
  TodoRepository,
  type TodoWithTags,
} from "@/repository/TodoRepository";

interface Params {
  filter?: TodoListFilter;
  sort?: TodoListSort;
}
export async function fetchTodosService({
  filter,
  sort,
}: Params): Promise<TodoWithTags[]> {
  const todoRepo = new TodoRepository(prisma);
  return todoRepo.list(filter, sort);
}
