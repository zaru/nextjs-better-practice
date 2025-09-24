import { deleteTagAction } from "@/app/tags/_actions/deleteTagAction";
import { Button } from "@/components/ui/button";
import type { Tag } from "@/types/todo";

interface TagListItemProps {
  tag: Tag;
  onEdit: (tag: Tag) => void;
}

export function TagListItem({ tag, onEdit }: TagListItemProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ja-JP");
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900 mb-2">{tag.name}</h3>
          <div className="text-xs text-gray-500">
            作成: {formatDate(tag.createdAt)} | 更新:{" "}
            {formatDate(tag.updatedAt)}
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          <Button variant="secondary" size="sm" onClick={() => onEdit(tag)}>
            編集
          </Button>

          <form action={deleteTagAction}>
            <input type="hidden" name="id" value={tag.id} />
            <Button
              variant="danger"
              size="sm"
              type="submit"
              onClick={(e) => {
                if (
                  !confirm(
                    "このタグを削除しますか？\n関連するTODOからも削除されます。",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              削除
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
