import type { TodoStatus as PrismaTodoStatus } from "@/generated/prisma";
import { TodoStatus } from "@/generated/prisma";

export { TodoStatus };
export type TodoStatusType = PrismaTodoStatus;

export type Todo = {
  id: string;
  content: string;
  status: TodoStatusType;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
};

export type Tag = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TodoFilter = {
  keyword?: string;
  status?: TodoStatusType[];
};

export type TodoSort = {
  field: "status" | "dueDate" | "createdAt";
  order: "asc" | "desc";
};

export type CreateTodoInput = {
  content: string;
  status?: TodoStatusType;
  dueDate?: Date;
  tagIds?: string[];
};

export type UpdateTodoInput = {
  content?: string;
  status?: TodoStatusType;
  dueDate?: Date | null;
  tagIds?: string[];
};

export type CreateTagInput = {
  name: string;
};

export type UpdateTagInput = {
  name: string;
};
