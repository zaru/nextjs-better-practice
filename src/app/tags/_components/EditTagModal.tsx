"use client";

import { updateTagAction } from "@/app/tags/_actions/updateTagAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tag } from "@/types/todo";

interface EditTagModalProps {
  tag: Tag;
  onClose: () => void;
}

export function EditTagModal({ tag, onClose }: EditTagModalProps) {
  const handleAction = async (formData: FormData) => {
    try {
      await updateTagAction(formData);
      onClose();
    } catch (error) {
      console.error("Error updating tag:", error);
      alert(error instanceof Error ? error.message : "更新に失敗しました");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">タグを編集</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form action={handleAction} className="space-y-4">
          <input type="hidden" name="id" value={tag.id} />

          <Input name="name" label="タグ名" defaultValue={tag.name} required />

          <Button type="submit" className="w-full">
            更新
          </Button>
        </form>
      </div>
    </div>
  );
}
