"use client";

import { useActionState, useState } from "react";
import { type ActionState, updateCourse } from "@/app/admin/actions";
import type { Course } from "@/db/schema";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 transition focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

export function EditCourseForm({ course }: { course: Course }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateCourse,
    null
  );
  const [thumb, setThumb] = useState(course.thumbnailUrl ?? "");

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="id" value={course.id} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={course.title}
          className={inputClass}
        />
      </div>

      <div>
        <p className="block text-sm font-medium text-white">スラッグ（変更不可）</p>
        <p className="mt-1 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 font-mono text-sm text-white/50">
          /{course.slug}
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-white"
        >
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={course.description ?? ""}
          placeholder="この講座で学べることを書きます"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="thumbnailUrl"
          className="block text-sm font-medium text-white"
        >
          サムネイル画像URL
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="url"
          value={thumb}
          onChange={(e) => setThumb(e.target.value)}
          placeholder="https://... の画像URL（任意・空でNo Image）"
          className={inputClass}
        />
        <div className="mt-3">
          {thumb.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt="サムネイルプレビュー"
              className="h-32 w-56 rounded-lg border border-white/10 object-cover"
            />
          ) : (
            <div className="grid h-32 w-56 place-items-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/30">
              No Image
            </div>
          )}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <input
          type="checkbox"
          name="published"
          className="mt-0.5 h-4 w-4 accent-indigo-500"
          defaultChecked={course.published}
        />
        <span className="text-sm text-white">
          <span className="font-medium">公開する</span>
          <span className="mt-1 block text-xs text-white/50">
            チェックを外すと「下書き」になり、受講者の一覧には出ません。
          </span>
        </span>
      </label>

      {state?.errors && state.errors.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
          {state.errors.map((e) => (
            <li key={e}>・{e}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}
