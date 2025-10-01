"use client";

import { useActionState } from "react";
import {
  type UploadTodoCsvState,
  uploadTodoCsv,
} from "@/app/todo/csv/import/_actions/uploadTodoCsv";

const initialState: UploadTodoCsvState = {
  success: false,
  message: "",
};

export function CsvUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadTodoCsv,
    initialState,
  );

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 font-semibold text-lg">Import Todos from CSV</h2>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="file" className="mb-2 block font-medium text-sm">
            Select CSV File
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".csv"
            required
            disabled={isPending}
            className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Uploading..." : "Upload CSV"}
        </button>
      </form>

      {state.message && (
        <div
          className={`mt-4 rounded p-4 ${
            state.success
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <p className="font-medium">{state.message}</p>

          {state.importedCount !== undefined && (
            <p className="mt-1 text-sm">
              Imported: {state.importedCount} todo(s)
            </p>
          )}
        </div>
      )}

      <details className="mt-4 text-gray-600 text-sm">
        <summary className="cursor-pointer font-medium">
          CSV Format Guide
        </summary>
        <div className="mt-2 space-y-2">
          <p>CSV must have the following headers:</p>
          <code className="block rounded bg-gray-100 p-2">
            content,status,dueDate,tags
          </code>

          <p className="mt-2">Example:</p>
          <code className="block rounded bg-gray-100 p-2 text-xs">
            買い物リストを作成,NOT_STARTED,2024-12-31,&quot;買い物,家事&quot;
            <br />
            デザインレビュー,IN_PROGRESS,,&quot;デザイン,urgent&quot;
            <br />
            バグ修正,NOT_STARTED,,開発
          </code>

          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>
              <strong>content:</strong> Required, task description
            </li>
            <li>
              <strong>status:</strong> Optional, one of: NOT_STARTED,
              IN_PROGRESS, NOT_APPLICABLE, WAITING, COMPLETED
            </li>
            <li>
              <strong>dueDate:</strong> Optional, format: YYYY-MM-DD
            </li>
            <li>
              <strong>tags:</strong> Optional, comma-separated tag names (use
              quotes if tags contain commas)
            </li>
          </ul>
        </div>
      </details>
    </div>
  );
}
