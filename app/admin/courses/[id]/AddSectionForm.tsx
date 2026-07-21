"use client";

import { useRef } from "react";
import { createSection } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 transition focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

export function AddSectionForm({ courseId }: { courseId: number }) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await createSection(formData);
        ref.current?.reset();
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      <input type="hidden" name="courseId" value={courseId} />
      <input
        name="title"
        required
        placeholder="新しいセクション名（例: 第2章 応用）"
        className={inputClass}
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        セクション追加
      </button>
    </form>
  );
}
