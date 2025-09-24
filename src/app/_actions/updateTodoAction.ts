"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateTodoService } from "@/service/updateTodoService";
import { TodoStatus, type TodoStatusType } from "@/types/todo";

const UpdateTodoSchema = z.object({
  id: z.string(),
  content: z.string().min(1, "タスク内容を入力してください").optional(),
  status: z.enum(Object.values(TodoStatus) as [string, ...string[]]).optional(),
  dueDate: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "") return null;
      return val ? new Date(val) : undefined;
    }),
  tagIds: z.array(z.string()).optional(),
});

export async function updateTodoAction(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
    content: formData.get("content"),
    status: formData.get("status"),
    dueDate: formData.get("dueDate"),
    tagIds: formData.getAll("tagIds"),
  };

  try {
    const validatedData = UpdateTodoSchema.parse(rawData);

    await updateTodoService(validatedData.id, {
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
