import { prisma } from "@/lib/prisma";
import {
  type TodoListFilter,
  type TodoListSort,
  type TodoWithTags,
  todoRepository,
} from "@/repository/TodoRepository";

interface Params {
  filter?: TodoListFilter;
  sort?: TodoListSort;
}
export async function fetchTodosService({
  filter,
  sort,
}: Params): Promise<TodoWithTags[]> {
  const todoRepo = todoRepository({ tx: prisma });
  return todoRepo.list(filter, sort);
}
