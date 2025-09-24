"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { deleteTagService } from "@/service/tag/deleteTagService";

const DeleteTagSchema = z.object({
  id: z.string().min(1, "IDが指定されていません"),
});

export async function deleteTagAction(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
  };

  try {
    const validatedData = DeleteTagSchema.parse(rawData);
    await deleteTagService(validatedData.id);
    revalidatePath("/tags");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}
