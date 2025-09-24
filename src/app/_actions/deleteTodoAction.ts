"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteTodoService } from "@/service/deleteTodoService";

const DeleteTodoSchema = z.object({
  id: z.string().min(1, "IDが指定されていません"),
});

export async function deleteTodoAction(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
  };

  try {
    const validatedData = DeleteTodoSchema.parse(rawData);
    await deleteTodoService(validatedData.id);
    revalidatePath("/");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}
