import Form from "next/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TodoStatus, type TodoStatusType } from "@/types/todo";

interface TodoSearchFormProps {
  initialKeyword?: string;
  initialStatuses?: TodoStatusType[];
}

const statusLabels: Record<TodoStatusType, string> = {
  NOT_STARTED: "未着手",
  IN_PROGRESS: "着手中",
  NOT_APPLICABLE: "対応しない",
  WAITING: "確認待ち",
  COMPLETED: "完了",
};

const statusOptions = Object.values(TodoStatus).map((status) => ({
  value: status,
  label: statusLabels[status],
}));

export function TodoSearchForm({
  initialKeyword = "",
  initialStatuses = [],
}: TodoSearchFormProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h3 className="font-medium text-gray-900">絞り込み・検索</h3>

      <Form action="">
        <div className="space-y-4">
          <Input
            name="keyword"
            label="キーワード検索"
            defaultValue={initialKeyword}
            placeholder="タスク内容を検索..."
          />

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="text-sm font-medium text-gray-700"
            >
              ステータス
            </label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    name="status"
                    value={option.value}
                    defaultChecked={initialStatuses.includes(option.value)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sortField"
              className="text-sm font-medium text-gray-700"
            >
              並び順
            </label>
            <select
              id="sortField"
              name="sortField"
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">作成日時</option>
              <option value="dueDate">完了期日</option>
              <option value="status">ステータス</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="sortOrder"
              className="text-sm font-medium text-gray-700"
            >
              順序
            </label>
            <select
              id="sortOrder"
              name="sortOrder"
              className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">降順</option>
              <option value="asc">昇順</option>
            </select>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" size="sm">
              検索
            </Button>
            <Button type="submit" variant="secondary" size="sm" formAction="?">
              リセット
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
