import { prisma } from "@/lib/prisma";
import { tagRepository } from "@/repository/TagRepository";
import { type TodoWithTags, todoRepository } from "@/repository/TodoRepository";
import { parseCsvWithSchema } from "@/util/csv";
import {
  TODO_CSV_HEADERS,
  type TodoCsvRow,
  todoCsvRowSchema,
} from "./todoCsvFormat";

export type ImportResult = {
  successCount: number;
  todos: TodoWithTags[];
};

/**
 * CSVテキストからTodoをインポートするService
 */
export async function importTodosFromCsvService(
  csvText: string,
): Promise<ImportResult> {
  const parseResult = parseCsvWithSchema(
    csvText,
    TODO_CSV_HEADERS,
    todoCsvRowSchema,
  );
  if (parseResult.errors.length > 0) {
    throw new Error(
      `CSV validation errors:\n${parseResult.errors.map((e) => `Row ${e.row}: ${e.message}`).join("\n")}`,
    );
  }

  return prisma.$transaction(async (tx) => {
    const todoRepo = todoRepository({ tx });
    const tagRepo = tagRepository({ tx });

    const tagNameToId = await ensureTagsAndGetIdMapping(
      parseResult.validRows,
      tagRepo,
    );

    const createdTodos: TodoWithTags[] = [];

    for (const row of parseResult.validRows) {
      const tagIds = row.tags
        .map((tagName) => tagNameToId.get(tagName))
        .filter((id): id is string => id !== undefined);

      const todo = await todoRepo.create({
        content: row.content,
        status: row.status,
        dueDate: row.dueDate,
        tagIds,
      });

      createdTodos.push(todo);
    }

    return {
      successCount: createdTodos.length,
      todos: createdTodos,
    };
  });
}

/**
 * タグの存在を保証し、タグ名→IDのマッピングを取得
 * 存在しないタグは作成する
 */
async function ensureTagsAndGetIdMapping(
  csvRows: TodoCsvRow[],
  tagRepo: ReturnType<typeof tagRepository>,
): Promise<Map<string, string>> {
  // CSV行からタグ名を抽出（重複・空文字排除）
  const tagNames = [...new Set(csvRows.flatMap((row) => row.tags))].filter(
    (name) => name.length > 0,
  );

  // 既存タグを取得
  const existingTags = await tagRepo.findManyByNames(tagNames);
  const existingTagNames = new Set(existingTags.map((tag) => tag.name));

  // 存在しないタグを作成（IDも取得）
  const newTagNames = tagNames.filter((name) => !existingTagNames.has(name));

  const newTags =
    newTagNames.length > 0
      ? await tagRepo.bulkCreateAndReturn(newTagNames.map((name) => ({ name })))
      : [];

  // 既存タグと新規タグをマージしてIDマッピング作成
  const allTags = [...existingTags, ...newTags];
  return new Map(allTags.map((tag) => [tag.name, tag.id]));
}
