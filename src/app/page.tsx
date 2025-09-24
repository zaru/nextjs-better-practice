import { z } from "zod";
import { CreateTodoModal } from "@/components/todo/CreateTodoModal";
import { TodoList } from "@/components/todo/TodoList";
import { TodoSearchForm } from "@/components/todo/TodoSearchForm";
import { fetchTagsService } from "@/service/fetchTagsService";
import { fetchTodosService } from "@/service/fetchTodosService";
import {
  type TodoFilter,
  type TodoSort,
  TodoStatus,
  type TodoStatusType,
} from "@/types/todo";

const SearchParamsSchema = z.object({
  keyword: z.string().optional(),
  status: z
    .union([
      z.enum(Object.values(TodoStatus) as [string, ...string[]]),
      z.array(z.enum(Object.values(TodoStatus) as [string, ...string[]])),
    ])
    .optional(),
  sortField: z.enum(["status", "dueDate", "createdAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

function parseSearchParams(
  rawParams: Record<string, string | string[] | undefined>,
) {
  try {
    return SearchParamsSchema.parse({
      keyword:
        typeof rawParams.keyword === "string" ? rawParams.keyword : undefined,
      status: rawParams.status,
      sortField:
        typeof rawParams.sortField === "string"
          ? rawParams.sortField
          : undefined,
      sortOrder:
        typeof rawParams.sortOrder === "string"
          ? rawParams.sortOrder
          : undefined,
    });
  } catch (_error) {
    // パースエラーの場合はデフォルト値を使用
    return SearchParamsSchema.parse({});
  }
}

export default async function Home(props: PageProps<"/">) {
  const rawParams = await props.searchParams;
  const parsedParams = parseSearchParams(rawParams);

  // 検索条件を構築
  const filter: TodoFilter = {
    keyword: parsedParams.keyword,
    status: parsedParams.status
      ? Array.isArray(parsedParams.status)
        ? (parsedParams.status as TodoStatusType[])
        : [parsedParams.status as TodoStatusType]
      : undefined,
  };

  const sort: TodoSort = {
    field: parsedParams.sortField,
    order: parsedParams.sortOrder,
  };

  // データを並行してフェッチ
  const [todos, tags] = await Promise.all([
    fetchTodosService(filter, sort),
    fetchTagsService(),
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TODO管理</h1>
          <p className="text-gray-600">タスクを効率的に管理しましょう</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* サイドバー - 検索・フィルタ */}
          <div className="lg:col-span-1">
            <TodoSearchForm
              initialKeyword={parsedParams.keyword}
              initialStatuses={filter.status || []}
            />
            <div className="mt-4">
              <CreateTodoModal tags={tags} />
            </div>
          </div>

          {/* メインコンテンツ - TODO一覧 */}
          <div className="lg:col-span-3">
            <TodoList todos={todos} tags={tags} />
          </div>
        </div>
      </div>
    </div>
  );
}
