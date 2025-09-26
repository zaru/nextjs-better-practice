"use client";

import { useActionState } from "react";
import { createTag } from "@/app/tag/_actions/createTag";

export function CreateTagForm() {
  const [state, action, isPending] = useActionState(createTag, {
    name: "",
    errors: null,
  });
  return (
    <form action={action}>
      {state.errors?.formErrors && (
        <div>{state.errors.formErrors.join(", ")}</div>
      )}

      <input type="text" name="name" defaultValue={state.name} />
      {state.errors?.fieldErrors?.name && (
        <div>{state.errors.fieldErrors.name}</div>
      )}

      <button type="submit" disabled={isPending}>
        Create Tag
      </button>
    </form>
  );
}
