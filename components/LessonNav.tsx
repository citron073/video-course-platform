import Link from "next/link";
import type { Lesson } from "@/db/schema";

/** 前後のレッスンへのナビゲーション。端では片側を非表示。 */
export default function LessonNav({
  prev,
  next,
}: {
  prev: Lesson | null;
  next: Lesson | null;
}) {
  return (
    <div className="mt-8 flex items-stretch justify-between gap-4">
      {prev ? (
        <Link
          href={`/learn/${prev.id}`}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
        >
          <span className="block text-xs text-white/50">← 前のレッスン</span>
          <span className="mt-1 block truncate text-sm font-medium">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={`/learn/${next.id}`}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-right transition hover:bg-white/10"
        >
          <span className="block text-xs text-white/50">次のレッスン →</span>
          <span className="mt-1 block truncate text-sm font-medium">
            {next.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
