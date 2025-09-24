import { createTagAction } from "@/app/tags/_actions/createTagAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateTagForm() {
  return (
    <form action={createTagAction} className="space-y-4">
      <Input
        name="name"
        label="タグ名"
        placeholder="タグ名を入力してください"
        required
      />

      <Button type="submit" className="w-full">
        タグを作成
      </Button>
    </form>
  );
}
