"use client";

import { useState } from "react";
import type { Tag } from "@/types/todo";
import { EditTagModal } from "./EditTagModal";
import { TagListItem } from "./TagListItem";

interface TagListProps {
  tags: Tag[];
}

export function TagList({ tags }: TagListProps) {
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
  };

  const handleCloseEdit = () => {
    setEditingTag(null);
  };

  if (tags.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-500">タグがありません</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {tags.map((tag) => (
          <TagListItem key={tag.id} tag={tag} onEdit={handleEdit} />
        ))}
      </div>

      {editingTag && (
        <EditTagModal tag={editingTag} onClose={handleCloseEdit} />
      )}
    </>
  );
}
