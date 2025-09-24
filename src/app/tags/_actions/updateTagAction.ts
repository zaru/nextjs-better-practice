"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateTagService } from "@/service/updateTagService";

const UpdateTagSchema = z.object({
  id: z.string().min(1, "IDが指定されていません"),
  name: z.string().min(1, "タグ名を入力してください"),
});

export async function updateTagAction(formData: FormData) {
  const rawData = {
    id: formData.get("id"),
    name: formData.get("name"),
  };

  try {
    const validatedData = UpdateTagSchema.parse(rawData);

    await updateTagService(validatedData.id, {
      name: validatedData.name,
    });

    revalidatePath("/tags");
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }
}
