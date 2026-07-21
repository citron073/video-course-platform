"use client";

import { useActionState } from "react";
import { createCourse, type ActionState } from "@/app/admin/actions";

const inputClass =
  "mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 transition focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

export function NewCourseForm({ blobEnabled }: { blobEnabled: boolean }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCourse,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white">
          タイトル <span className="text-red-400">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="例: Claude Code 入門"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-white">
          スラッグ（URL用）
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="例: claude-code-intro（空ならタイトルから自動生成）"
          className={`${inputClass} font-mono`}
        />
        <p className="mt-1 text-xs text-white/50">
          小文字の英数字とハイフンのみ。
          <strong className="text-white/70">重複NG</strong>
          （同じ値があると保存エラーになります）
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
          placeholder="https://... の画像URL（任意）"
          className={inputClass}
        />
        <p className="mt-1 text-xs text-white/50">
          画像のURLを直接指定できます（今すぐ使えます）。
        </p>
      </div>

      <div>
        <label
          htmlFor="thumbnail"
          className="block text-sm font-medium text-white"
        >
          サムネイル画像ファイル
        </label>
        {blobEnabled ? (
          <>
            <input
              id="thumbnail"
              name="thumbnail"
              type="file"
              accept="image/*"
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-500 file:px-3 file:py-1.5 file:text-xs file:text-white hover:file:bg-indigo-400"
            />
            <p className="mt-1 text-xs text-white/50">
              PNG / JPEG / WebP / GIF・5MB以内。ファイルを選ぶと上のURLより優先されます。
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
              className="mt-1 w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-white/30"
            />
            <p className="mt-1 rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
              画像アップロードは未設定です（
              <code className="mx-1">BLOB_READ_WRITE_TOKEN</code>
              ）。Vercel の Storage → Blob でトークンを発行し環境変数に入れて再デプロイすると有効になります。
            </p>
          </>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <input
          type="checkbox"
          name="published"
          className="mt-0.5 h-4 w-4 accent-indigo-500"
          defaultChecked
        />
        <span className="text-sm text-white">
          <span className="font-medium">公開する</span>
          <span className="mt-1 block text-xs text-white/50">
            チェックを外すと「下書き」になり、受講者の一覧には出ません（棚に並びません）。
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
        className="w-full rounded-lg bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {pending ? "保存中…" : "保存する"}
      </button>
    </form>
  );
}
