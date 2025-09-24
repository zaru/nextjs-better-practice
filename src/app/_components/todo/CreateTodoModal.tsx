"use client";

import { useState } from "react";
import { createTodoAction } from "@/app/_actions/createTodoAction";
import { Button } from "@/components/ui/button";
import type { Tag } from "@/types/todo";
import { TodoForm } from "./TodoForm";

interface CreateTodoModalProps {
  tags: Tag[];
}

export function CreateTodoModal({ tags }: CreateTodoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = async (formData: FormData) => {
    try {
      await createTodoAction(formData);
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating todo:", error);
      alert(error instanceof Error ? error.message : "作成に失敗しました");
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full">
        新しいTODOを作成
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">新しいTODOを作成</h2>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <TodoForm action={handleAction} tags={tags} submitLabel="作成" />
      </div>
    </div>
  );
}
