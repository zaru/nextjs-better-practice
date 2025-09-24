import type { PrismaClient } from "@/generated/prisma";
import type { prisma } from "@/lib/prisma";
import type {
  CreateTodoInput,
  Todo,
  TodoFilter,
  TodoSort,
  UpdateTodoInput,
} from "@/types/todo";

type PrismaTransaction = Parameters<
  Parameters<typeof prisma.$transaction>[0]
>[0];

export class TodoRepository {
  constructor(private readonly tx: PrismaClient | PrismaTransaction) {}

  async list(filter?: TodoFilter, sort?: TodoSort): Promise<Todo[]> {
    const todos = await this.tx.todo.findMany({
      select: {
        id: true,
        content: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      where: {
        ...(filter?.keyword && {
          content: {
            contains: filter.keyword,
          },
        }),
        ...(filter?.status &&
          filter.status.length > 0 && {
            status: {
              in: filter.status,
            },
          }),
      },
      orderBy: sort
        ? {
            [sort.field]: sort.order,
          }
        : {
            createdAt: "desc",
          },
    });

    return todos.map((todo) => ({
      ...todo,
      tags: todo.tags.map((t) => t.tag),
    }));
  }

  async find(id: string): Promise<Todo | null> {
    const todo = await this.tx.todo.findUnique({
      select: {
        id: true,
        content: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
      where: { id },
    });

    if (!todo) return null;

    return {
      ...todo,
      tags: todo.tags.map((t) => t.tag),
    };
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const todo = await this.tx.todo.create({
      data: {
        content: input.content,
        status: input.status,
        dueDate: input.dueDate,
        tags: input.tagIds
          ? {
              create: input.tagIds.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        content: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    return {
      ...todo,
      tags: todo.tags.map((t) => t.tag),
    };
  }

  async update(id: string, input: UpdateTodoInput): Promise<Todo> {
    // タグの関連付けを更新する場合は、まず既存の関連を削除
    if (input.tagIds !== undefined) {
      await this.tx.todoTag.deleteMany({
        where: { todoId: id },
      });
    }

    // TODOを更新
    const todo = await this.tx.todo.update({
      where: { id },
      data: {
        ...(input.content !== undefined && { content: input.content }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
        ...(input.tagIds !== undefined && {
          tags: {
            create: input.tagIds.map((tagId) => ({
              tag: {
                connect: { id: tagId },
              },
            })),
          },
        }),
      },
      select: {
        id: true,
        content: true,
        status: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    return {
      ...todo,
      tags: todo.tags.map((t) => t.tag),
    };
  }

  async delete(id: string): Promise<void> {
    await this.tx.todo.delete({
      where: { id },
    });
  }
}
