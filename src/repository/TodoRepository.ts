import { z } from "zod";
import {
  type Prisma,
  type PrismaClient,
  TodoStatus as TodoStatusObject,
} from "@/generated/prisma";
import type { PrismaTransaction } from "@/lib/prisma";
import { type Tag, tagSelect } from "@/repository/TagRepository";

const todoSelect = {
  id: true,
  content: true,
  status: true,
  dueDate: true,
} satisfies Prisma.TodoSelect;

const todoWithTagsSelect = {
  ...todoSelect,
  tags: {
    select: {
      tag: {
        select: tagSelect,
      },
    },
  },
} satisfies Prisma.TodoSelect;

export type Todo = Prisma.TodoGetPayload<{ select: typeof todoSelect }>;
export type TodoWithTags = Todo & { tags: Tag[] };

export type TodoListFilter = {
  keyword?: string;
  status?: Todo["status"][];
};

export type TodoListSort = {
  field: keyof Pick<
    Prisma.TodoOrderByWithRelationInput,
    "content" | "dueDate" | "status"
  >;
  order: Prisma.SortOrder;
};

export const todoRepository = ({
  tx,
}: {
  tx: PrismaClient | PrismaTransaction;
}) => ({
  list: async (
    filter?: TodoListFilter,
    sort?: TodoListSort,
  ): Promise<TodoWithTags[]> => {
    const todos = await tx.todo.findMany({
      select: todoWithTagsSelect,
      where: {
        ...(filter?.keyword && {
          content: { contains: filter.keyword },
        }),
        ...(filter?.status &&
          filter.status.length > 0 && {
            status: { in: filter.status },
          }),
      },
      orderBy: sort ? { [sort.field]: sort.order } : { createdAt: "desc" },
    });

    return todos.map((todo) => transformTodoWithTags(todo));
  },

  find: async (id: string): Promise<TodoWithTags | null> => {
    const todoWithTag = await tx.todo.findUnique({
      select: todoWithTagsSelect,
      where: { id },
    });

    if (!todoWithTag) return null;

    return transformTodoWithTags(todoWithTag);
  },

  create: async (
    input: Pick<Prisma.TodoCreateInput, "content" | "status" | "dueDate"> & {
      tagIds?: string[];
    },
  ): Promise<TodoWithTags> => {
    const todoWithTag = await tx.todo.create({
      data: {
        content: input.content,
        ...(input.status && { status: input.status }),
        ...(input.dueDate && { dueDate: input.dueDate }),
        ...(input.tagIds !== undefined && associateTags(input.tagIds)),
      },
      select: todoWithTagsSelect,
    });

    return transformTodoWithTags(todoWithTag);
  },

  update: async (
    id: string,
    input: Pick<Prisma.TodoUpdateInput, "content" | "status" | "dueDate"> & {
      tagIds?: string[];
    },
  ): Promise<TodoWithTags> => {
    // タグの関連付けを更新する場合は、まず既存の関連を削除
    if (input.tagIds !== undefined) {
      await tx.todoTag.deleteMany({
        where: { todoId: id },
      });
    }

    const todoWithTag = await tx.todo.update({
      where: { id },
      data: {
        ...(input.content !== undefined && { content: input.content }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
        ...(input.tagIds !== undefined && associateTags(input.tagIds)),
      },
      select: todoWithTagsSelect,
    });

    return transformTodoWithTags(todoWithTag);
  },

  delete: async (id: string): Promise<void> => {
    await tx.todo.delete({
      where: { id },
    });
  },
});

/**
 * ToDo作成・更新時に、指定のタグ一覧との関連付けを一緒に作成するデータ整形
 * 更新の場合、事前に関連タグを削除したうえで再作成するので create のみでOK
 */
function associateTags(tagIds: string[]) {
  return {
    tags: {
      create: tagIds.map((tagId) => ({
        tag: { connect: { id: tagId } },
      })),
    },
  };
}

/**
 * ToDoとタグの結合データを使いやすいように構造を変更する
 * TODO: これは…ビジネスロジックか？いや違うよな…？
 */
function transformTodoWithTags(
  todoWithTag: Prisma.TodoGetPayload<{ select: typeof todoWithTagsSelect }>,
): TodoWithTags {
  const { tags, ...todo } = todoWithTag;
  return {
    ...todo,
    tags: tags.map((t) => t.tag),
  };
}
