"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTagService } from "@/service/tag/createTagService";

const schema = z.object({
  name: z.string().min(1),
});
type CreateTagSchema = z.infer<typeof schema>;
export type CreateTagPayload = CreateTagSchema & {
  errors: {
    formErrors: string[];
    fieldErrors?: Partial<Record<keyof CreateTagSchema, string[]>>;
  } | null;
};

export async function createTag(
  _prev: CreateTagPayload,
  formData: FormData,
): Promise<CreateTagPayload> {
  // MEMO: 認証チェックを入れること

  const name = formData.get("name") as string;
  const parsed = schema.safeParse({ name });
  if (!parsed.success) {
    return { name, errors: z.flattenError(parsed.error) };
  }

  // MEMO: 権限チェックをいれること

  try {
    await createTagService({
      name: parsed.data.name,
    });
  } catch {
    return {
      name: parsed.data.name,
      errors: { formErrors: ["タグの作成に失敗しました"] },
    };
  }

  revalidatePath("/tag");

  return { name: "", errors: null };
}
