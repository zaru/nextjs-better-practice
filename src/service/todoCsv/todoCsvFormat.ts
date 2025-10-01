import { z } from "zod";
import { TodoStatus as TodoStatusObject } from "@/generated/prisma";

/**
 * TodoのCSV交換フォーマット定義
 */
const TodoStatus = Object.values(TodoStatusObject);

// CSVヘッダー定義（順序も含めて仕様）
export const TODO_CSV_HEADERS = [
  "content",
  "status",
  "dueDate",
  "tags",
] as const;

// CSV行のZodスキーマ（バリデーション用）
export const todoCsvRowSchema = z.object({
  content: z.string().min(1, "Content is required"),
  status: z.enum(TodoStatus).optional().default("NOT_STARTED"),
  dueDate: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.coerce.date().optional(),
  ),
  tags: z.preprocess((val) => {
    if (typeof val !== "string" || val.trim() === "") return [];
    return val
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, z.array(z.string())),
});

// 型定義（インポート用）
export type TodoCsvRow = z.infer<typeof todoCsvRowSchema>;

// エクスポート用の型定義（Dateを文字列に変換したもの）
export type TodoCsvExportRow = {
  content: string;
  status: string;
  dueDate: string;
  tags: string;
};

/**
 * TodoをCSV行にシリアライズ
 * エクスポート時に使用
 */
export function serializeTodoCsvRow(todo: {
  content: string;
  status: string;
  dueDate?: Date | null;
  tags: Array<{ name: string }>;
}): TodoCsvExportRow {
  return {
    content: todo.content,
    status: todo.status,
    dueDate: todo.dueDate ? todo.dueDate.toISOString().split("T")[0] : "",
    tags: todo.tags.map((t) => t.name).join(","),
  };
}
