import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";
import { isAdmin, isVisibleToViewer } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";

/**
 * 講座トップ（受講者の入口）。
 * EP34: published=true の講座だけが「棚に並ぶ」。管理者には下書きも見える。
 */
export default async function Home() {
  const user = await getCurrentUser();
  const viewerRole = user?.role ?? null;

  const all = await db.select().from(courses).orderBy(asc(courses.createdAt));
  const visible = all.filter((c) => isVisibleToViewer(c, viewerRole));

  // 各講座の最初のレッスンとレッスン数を集める
  const withMeta = await Promise.all(
    visible.map(async (course) => {
      const rows = await db
        .select({ lessonId: lessons.id })
        .from(sections)
        .innerJoin(lessons, eq(lessons.sectionId, sections.id))
        .where(eq(sections.courseId, course.id))
        .orderBy(asc(sections.order), asc(lessons.order));

      return {
        ...course,
        lessonCount: rows.length,
        firstLessonId: rows[0]?.lessonId ?? null,
      };
    })
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      {/* ヒーロー：いきなり講座を出す前に「何が学べるか」を一言 */}
      <section className="mb-12">
        <p className="text-sm font-medium text-indigo-400">動画講座プラットフォーム</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          動画で学ぶ、あなたの講座
        </h1>
        <p className="mt-3 max-w-2xl text-white/60 leading-relaxed">
          セクションごとにレッスンを順番に視聴。好きなときに、どのデバイスからでも受講できます。
        </p>
      </section>

      <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-white/40">
        講座一覧（{withMeta.length}）
      </h2>

      {withMeta.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8">
          <p className="font-medium text-white">
            まだ公開されている講座がありません。
          </p>
          <p className="mt-3 text-sm text-white/60">
            {isAdmin(viewerRole) ? (
              <>
                <Link
                  href="/admin/courses/new"
                  className="text-indigo-400 underline"
                >
                  管理画面から講座を作成
                </Link>
                して「公開する」にチェックすると、ここに並びます。
              </>
            ) : (
              <>
                管理者が講座を公開すると、ここに表示されます。
                <br />
                <Link href="/login" className="text-indigo-400 underline">
                  ログイン
                </Link>
                すると受講状況が保存されます。
              </>
            )}
          </p>
        </div>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {withMeta.map((course) => (
            <li
              key={course.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/25 hover:bg-white/[0.05]"
            >
              {/* サムネイル。あれば表示、無ければ No Image。
                  外部Blob URLなので next/image ではなく素の img を使う。 */}
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnailUrl}
                  alt={`${course.title} のサムネイル`}
                  loading="lazy"
                  className="aspect-video w-full border-b border-white/10 object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full flex-col items-center justify-center gap-1 border-b border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent text-white/30">
                  <svg
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9.5" r="1.5" />
                    <path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
                  </svg>
                  <span className="text-xs">No Image</span>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white">{course.title}</h3>
                  {!course.published && (
                    <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs text-amber-300">
                      下書き
                    </span>
                  )}
                </div>

                {course.description && (
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                    {course.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-white/40">
                    {course.lessonCount} レッスン
                  </span>
                  {course.firstLessonId ? (
                    <Link
                      href={`/learn/${course.firstLessonId}`}
                      className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
                    >
                      受講をはじめる →
                    </Link>
                  ) : (
                    <span className="text-xs text-white/40">レッスン準備中</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
