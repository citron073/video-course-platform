"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { CourseStructure } from "@/db/queries";

/**
 * セクションごとにレッスンを一覧表示。現在のレッスンを usePathname で判定しハイライト。
 * モバイルでは開閉トグルで折りたためる。
 *
 * 将来「視聴済み✓」を出す場合は、各レッスン行（li 内）に印を差し込めるよう
 * レッスン行を独立要素にしてある。
 */
export default function LessonSidebar({
  structure,
}: {
  structure: CourseStructure;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // 講座全体の通し番号
  let counter = 0;

  return (
    <nav className="md:h-full md:overflow-y-auto border-b md:border-b-0 md:border-r border-white/10 bg-[#0e1422]">
      {/* モバイル用ヘッダー（開閉トグル） */}
      <div className="flex items-center justify-between p-4 md:hidden">
        <span className="font-semibold">{structure.title}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-white/15 px-3 py-1 text-sm"
          aria-expanded={open}
        >
          {open ? "閉じる" : "目次"}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} md:block`}>
        <div className="hidden md:block p-4 border-b border-white/10">
          <Link href="/" className="text-sm text-white/60 hover:text-white">
            ← 講座トップ
          </Link>
          <h2 className="mt-2 font-semibold leading-snug">{structure.title}</h2>
        </div>

        <ol className="p-2">
          {structure.sections.map((section) => (
            <li key={section.id} className="mb-3">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-white/50">
                {section.title}
              </p>
              <ul>
                {section.lessons.map((lesson) => {
                  counter += 1;
                  const href = `/learn/${lesson.id}`;
                  const active = pathname === href;
                  return (
                    <li key={lesson.id}>
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm transition ${
                          active
                            ? "bg-indigo-500/20 text-white"
                            : "text-white/75 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span className="mt-0.5 w-5 shrink-0 text-right text-white/40 tabular-nums">
                          {counter}
                        </span>
                        <span>{lesson.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
