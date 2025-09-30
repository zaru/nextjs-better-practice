import Link from "next/link";
import { z } from "zod";
import { CreateTagForm } from "@/app/tag/_components/CreateTagForm";
import { fetchTagsService } from "@/service/tag/fetchTagsService";

const ITEMS_PER_PAGE = 2;

const searchParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
});

export default async function Page(props: PageProps<"/tag">) {
  const { searchParams } = props;
  const { page } = searchParamsSchema.parse(await searchParams);
  const { total, items } = await fetchTagsService({
    page,
    take: ITEMS_PER_PAGE,
  });

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <div>
      <h1>Tag</h1>
      <CreateTagForm />
      <section>
        <p>
          Total: {total} items (Page {page} of {totalPages})
        </p>
        <ul>
          {items.map((tag) => (
            <li key={tag.id}>{tag.name}</li>
          ))}
        </ul>
        <nav>
          {hasPrevious && <Link href={`/tag?page=${page - 1}`}>Previous</Link>}
          {hasNext && <Link href={`/tag?page=${page + 1}`}>Next</Link>}
        </nav>
      </section>
    </div>
  );
}
