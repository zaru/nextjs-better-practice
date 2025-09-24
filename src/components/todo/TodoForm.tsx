import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { type Tag, TodoStatus, type TodoStatusType } from "@/types/todo";

interface TodoFormProps {
  action: (formData: FormData) => void;
  initialData?: {
    id?: string;
    content?: string;
    status?: TodoStatusType;
    dueDate?: Date | null;
    tagIds?: string[];
  };
  tags: Tag[];
  submitLabel: string;
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

export function TodoForm({
  action,
  initialData,
  tags,
  submitLabel,
}: TodoFormProps) {
  return (
    <form action={action} className="space-y-4">
      {initialData?.id && (
        <input type="hidden" name="id" value={initialData.id} />
      )}

      <Input
        name="content"
        label="タスク内容"
        defaultValue={initialData?.content}
        required
      />

      <Select
        name="status"
        label="ステータス"
        options={statusOptions}
        defaultValue={initialData?.status || TodoStatus.NOT_STARTED}
      />

      <Input
        name="dueDate"
        label="完了期日"
        type="date"
        defaultValue={
          initialData?.dueDate
            ? initialData.dueDate.toISOString().split("T")[0]
            : ""
        }
      />

      <div className="space-y-2">
        <label htmlFor="tagIds" className="text-sm font-medium text-gray-700">
          タグ
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
          {tags.map((tag) => (
            <label key={tag.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="tagIds"
                value={tag.id}
                defaultChecked={initialData?.tagIds?.includes(tag.id)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">{tag.name}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
