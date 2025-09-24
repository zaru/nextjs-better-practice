"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTagService } from "@/service/tag/createTagService";

const CreateTagSchema = z.object({
  name: z.string().min(1, "タグ名を入力してください"),
});

export async function createTagAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
  };

  try {
    const validatedData = CreateTagSchema.parse(rawData);

    await createTagService({
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
