import { CreateTagForm } from "@/app/tag/_components/CreateTagForm";
import { fetchTagsService } from "@/service/tag/fetchTagsService";

export default async function Page() {
  const tags = await fetchTagsService();
  return (
    <div>
      <h1>Tag</h1>
      <CreateTagForm />
      <div>
        {tags.map((tag) => (
          <div key={tag.id}>{tag.name}</div>
        ))}
      </div>
    </div>
  );
}
