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
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-medium text-indigo-400">動画講座</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">講座一覧</h1>

      {withMeta.length === 0 ? (
        <div className="mt-10 rounded-lg border border-white/10 p-8">
          <p className="font-medium">まだ公開されている講座がありません。</p>
          <p className="mt-3 text-sm text-white/70">
            {isAdmin(viewerRole) ? (
              <>
                <Link href="/admin/courses/new" className="underline">
                  管理画面から講座を作成
                </Link>
                して「公開する」にチェックすると、ここに並びます。
              </>
            ) : (
              <>
                管理者が講座を公開すると、ここに表示されます。
                <br />
                <Link href="/login" className="underline">
                  ログイン
                </Link>
                すると受講状況が保存されます。
              </>
            )}
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {withMeta.map((course) => (
            <li
              key={course.id}
              className="rounded-lg border border-white/10 p-6 transition hover:border-white/25"
            >
              {/* EP35: サムネイル画像。あれば表示、無ければ No Image。
                  外部Blob URLなので next/image ではなく素の img を使う。 */}
              {course.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={course.thumbnailUrl}
                  alt={`${course.title} のサムネイル`}
                  className="mb-4 aspect-video w-full rounded-lg border border-white/10 object-cover"
                />
              ) : (
                <div className="mb-4 flex aspect-video w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/40">
                  No Image
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  {course.description && (
                    <p className="mt-2 text-sm leading-relaxed text-white/70">
                      {course.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-white/50">
                    {course.lessonCount} レッスン
                  </p>
                </div>
                {/* 下書きは管理者にしか見えない。目印を付ける */}
                {!course.published && (
                  <span className="shrink-0 rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
                    下書き
                  </span>
                )}
              </div>

              {course.firstLessonId ? (
                <Link
                  href={`/learn/${course.firstLessonId}`}
                  className="mt-5 inline-block rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  受講をはじめる →
                </Link>
              ) : (
                <p className="mt-5 text-xs text-white/50">
                  レッスン準備中（セクション・レッスンを追加してください）
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
