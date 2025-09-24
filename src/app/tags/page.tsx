import Link from "next/link";
import { CreateTagForm } from "@/app/tags/_components/CreateTagForm";
import { TagList } from "@/app/tags/_components/TagList";
import { fetchTagsService } from "@/service/tag/fetchTagsService";

export default async function TagsPage(_props: PageProps<"/tags">) {
  const tags = await fetchTagsService();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                タグ管理
              </h1>
              <p className="text-gray-600">タグを作成・編集・削除できます</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← TODO一覧に戻る
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 新規作成フォーム */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              新しいタグを作成
            </h2>
            <div className="bg-white rounded-lg p-6">
              <CreateTagForm />
            </div>
          </div>

          {/* タグ一覧 */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              タグ一覧 ({tags.length}件)
            </h2>
            <TagList tags={tags} />
          </div>
        </div>
      </div>
    </div>
  );
}
