"use client";

import { useActionState } from "react";
import { createCourse, type ActionState } from "@/app/admin/actions";

export function NewCourseForm({ blobEnabled }: { blobEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCourse,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="例: Claude Code 入門"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          スラッグ（URL用）
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="例: claude-code-intro（空ならタイトルから自動生成）"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          小文字の英数字とハイフンのみ。<strong>重複NG</strong>
          （同じ値があると保存エラーになります）
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          説明
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          placeholder="この講座で学べることを書きます"
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="thumbnail" className="block text-sm font-medium">
          サムネイル画像
        </label>
        {blobEnabled ? (
          <>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">
              PNG / JPEG / WebP / GIF・5MB以内。未選択なら「No Image」になります。
            </p>
          </>
        ) : (
          <>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              disabled
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-400"
            />
            <p className="mt-1 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
              画像アップロードは未設定です（
              <code className="mx-1">BLOB_READ_WRITE_TOKEN</code>
              ）。Vercel の Storage → Blob でトークンを発行し
              <code className="mx-1">.env.local</code>
              に入れて再起動すると有効になります。
            </p>
          </>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg bg-gray-50 p-4">
        <input
          type="checkbox"
          name="published"
          className="mt-0.5 h-4 w-4"
          defaultChecked
        />
        <span className="text-sm">
          <span className="font-medium">公開する</span>
          <span className="mt-1 block text-xs text-gray-600">
            チェックを外すと「下書き」になり、受講者の一覧には出ません（棚に並びません）。
          </span>
        </span>
      </label>

      {state?.errors && state.errors.length > 0 && (
        <ul className="space-y-1 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {state.errors.map((e) => (
            <li key={e}>・{e}</li>
          ))}
        </ul>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}
