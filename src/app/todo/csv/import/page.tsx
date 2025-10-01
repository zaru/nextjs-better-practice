import { CsvUploadForm } from "@/app/todo/csv/import/_components/CsvUploadForm";

export default function Page() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 font-bold text-3xl">Import Todos from CSV</h1>

      <CsvUploadForm />
    </div>
  );
}
