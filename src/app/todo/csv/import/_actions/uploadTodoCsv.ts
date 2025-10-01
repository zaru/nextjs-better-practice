"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { importTodosFromCsvService } from "@/service/todoCsv/importTodosFromCsvService";

export type UploadTodoCsvState = {
  success: boolean;
  message: string;
  importedCount?: number;
};

const uploadSchema = z.object({
  file: z
    .file()
    .max(5 * 1024 * 1024, "File size exceeds 5MB limit")
    .mime(
      ["text/csv", "application/vnd.ms-excel"],
      "Only CSV files are allowed",
    ),
});

export async function uploadTodoCsv(
  _prevState: UploadTodoCsvState | null,
  formData: FormData,
): Promise<UploadTodoCsvState> {
  // TODO: 認証チェック

  const parsed = uploadSchema.safeParse({
    file: formData.get("file"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid file",
    };
  }

  try {
    const csvText = await parsed.data.file.text();
    const result = await importTodosFromCsvService(csvText);

    revalidatePath("/todo/csv/import");

    return {
      success: true,
      message: `Successfully imported ${result.successCount} todo(s)`,
      importedCount: result.successCount,
    };
  } catch (error) {
    console.error("CSV upload error:", error);

    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import CSV",
    };
  }
}
