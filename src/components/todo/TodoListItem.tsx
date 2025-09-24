import { deleteTodoAction } from "@/app/_actions/deleteTodoAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Todo } from "@/types/todo";
import { TodoStatusBadge } from "./TodoStatusBadge";

interface TodoListItemProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
}

export function TodoListItem({ todo, onEdit }: TodoListItemProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("ja-JP");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <h3 className="font-medium text-gray-900">{todo.content}</h3>

          <div className="flex items-center space-x-2">
            <TodoStatusBadge status={todo.status} />
            <span className="text-sm text-gray-500">
              期日: {formatDate(todo.dueDate)}
            </span>
          </div>

          {todo.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {todo.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-2 ml-4">
          <Button variant="secondary" size="sm" onClick={() => onEdit(todo)}>
            編集
          </Button>

          <form action={deleteTodoAction}>
            <input type="hidden" name="id" value={todo.id} />
            <Button
              variant="danger"
              size="sm"
              type="submit"
              onClick={(e) => {
                if (!confirm("このTODOを削除しますか？")) {
                  e.preventDefault();
                }
              }}
            >
              削除
            </Button>
          </form>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        作成: {formatDate(todo.createdAt)} | 更新: {formatDate(todo.updatedAt)}
      </div>
    </div>
  );
}
