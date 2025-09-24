"use client";

import { updateTodoAction } from "@/app/_actions/updateTodoAction";
import type { Tag, Todo } from "@/types/todo";
import { TodoForm } from "./TodoForm";

interface EditTodoModalProps {
  todo: Todo;
  tags: Tag[];
  onClose: () => void;
}

export function EditTodoModal({ todo, tags, onClose }: EditTodoModalProps) {
  const handleAction = async (formData: FormData) => {
    try {
      await updateTodoAction(formData);
      onClose();
    } catch (error) {
      console.error("Error updating todo:", error);
      alert(error instanceof Error ? error.message : "更新に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">TODOを編集</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <TodoForm
          action={handleAction}
          initialData={{
            id: todo.id,
            content: todo.content,
            status: todo.status,
            dueDate: todo.dueDate,
            tagIds: todo.tags.map((tag) => tag.id),
          }}
          tags={tags}
          submitLabel="更新"
        />
      </div>
    </div>
  );
}
