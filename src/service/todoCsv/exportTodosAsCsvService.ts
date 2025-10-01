import { prisma } from "@/lib/prisma";
import { todoRepository } from "@/repository/TodoRepository";
import { csvObjectsToText } from "@/util/csv";
import { serializeTodoCsvRow, TODO_CSV_HEADERS } from "./todoCsvFormat";

/**
 * TodoリストをCSV形式でエクスポートするService
 */
export async function exportTodosAsCsvService(): Promise<string> {
  const todoRepo = todoRepository({ tx: prisma });
  const todos = await todoRepo.list();
  const csvRows = todos.map((todo) => serializeTodoCsvRow(todo));
  return csvObjectsToText(csvRows, TODO_CSV_HEADERS);
}
