"use client";

import { useRef } from "react";
import { createLesson } from "@/app/admin/actions";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 transition focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

export function AddLessonForm({
  sectionId,
  courseId,
}: {
  sectionId: number;
  courseId: number;
}) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await createLesson(formData);
        ref.current?.reset();
      }}
      className="mt-3 space-y-2 rounded-lg border border-white/10 bg-white/[0.02] p-3"
    >
      <input type="hidden" name="sectionId" value={sectionId} />
      <input type="hidden" name="courseId" value={courseId} />
      <input
        name="title"
        required
        placeholder="レッスン名（例: 環境構築）"
        className={inputClass}
      />
      <input
        name="youtubeId"
        placeholder="YouTube URL または ID・空欄で動画準備中"
        className={`${inputClass} font-mono`}
      />
      <textarea
        name="description"
        rows={2}
        placeholder="レッスンの説明（任意）"
        className={inputClass}
      />
      <button
        type="submit"
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
      >
        レッスン追加
      </button>
    </form>
  );
}
