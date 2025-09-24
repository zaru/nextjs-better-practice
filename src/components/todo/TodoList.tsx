"use client";

import { useState } from "react";
import type { Tag, Todo } from "@/types/todo";
import { EditTodoModal } from "./EditTodoModal";
import { TodoListItem } from "./TodoListItem";

interface TodoListProps {
  todos: Todo[];
  tags: Tag[];
}

export function TodoList({ todos, tags }: TodoListProps) {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleCloseEdit = () => {
    setEditingTodo(null);
  };

  if (todos.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">該当するTODOがありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            TODO一覧 ({todos.length}件)
          </h2>
        </div>

        <div className="space-y-3">
          {todos.map((todo) => (
            <TodoListItem key={todo.id} todo={todo} onEdit={handleEdit} />
          ))}
        </div>
      </div>

      {editingTodo && (
        <EditTodoModal
          todo={editingTodo}
          tags={tags}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
}
