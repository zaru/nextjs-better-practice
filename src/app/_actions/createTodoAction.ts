"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTodoService } from "@/service/todo/createTodoService";
import { TodoStatus, type TodoStatusType } from "@/types/todo";

const CreateTodoSchema = z.object({
  content: z.string().min(1, "タスク内容を入力してください"),
  status: z.enum(Object.values(TodoStatus) as [string, ...string[]]).optional(),
  dueDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  tagIds: z.array(z.string()).optional(),
});

export async function createTodoAction(formData: FormData) {
  const rawData = {
    content: formData.get("content"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
    tagIds: formData.getAll("tagIds"),
  };

  try {
    const validatedData = CreateTodoSchema.parse(rawData);

    await createTodoService({
      content: validatedData.content,
      status: validatedData.status as TodoStatusType | undefined,
      dueDate: validatedData.dueDate,
      tagIds: validatedData.tagIds?.length ? validatedData.tagIds : undefined,
    });

    revalidatePath("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}
