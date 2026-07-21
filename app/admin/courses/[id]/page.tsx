import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCourseForAdmin } from "@/db/queries";
import { canAccessAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { deleteLesson, deleteSection } from "../../actions";
import { AddLessonForm } from "./AddLessonForm";
import { AddSectionForm } from "./AddSectionForm";
import { EditCourseForm } from "./EditCourseForm";

export const metadata = { title: "コース編集 | 管理画面" };

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canAccessAdmin(user)) redirect("/admin");

  const { id } = await params;
  const courseId = Number(id);
  if (!Number.isInteger(courseId)) notFound();

  const course = await getCourseForAdmin(courseId);
  if (!course) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">コース編集</h1>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs ${
            course.published
              ? "bg-emerald-400/15 text-emerald-300"
              : "bg-white/10 text-white/50"
          }`}
        >
          {course.published ? "公開中" : "下書き"}
        </span>
      </div>

      {/* コース基本情報 */}
      <section className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-sm font-semibold text-white/50">基本情報</h2>
        <div className="mt-4">
          <EditCourseForm course={course} />
        </div>
      </section>

      {/* セクション＆レッスン管理 */}
      <section className="mt-10">
        <h2 className="text-sm font-semibold text-white/50">
          セクション・レッスン（{course.sections.length}章）
        </h2>

        {course.sections.length === 0 ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            まだセクションがありません。下の「セクション追加」から作成してください。
          </p>
        ) : (
          <ul className="mt-4 space-y-5">
            {course.sections.map((section) => (
              <li
                key={section.id}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium text-white">{section.title}</h3>
                  <form action={deleteSection}>
                    <input type="hidden" name="id" value={section.id} />
                    <input type="hidden" name="courseId" value={course.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-red-400/30 px-3 py-1 text-xs text-red-300 transition hover:bg-red-400/10"
                    >
                      セクション削除
                    </button>
                  </form>
                </div>

                {/* レッスン一覧 */}
                {section.lessons.length === 0 ? (
                  <p className="mt-3 text-sm text-white/40">
                    レッスンはまだありません。
                  </p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-white">
                            {lesson.title}
                          </p>
                          {lesson.youtubeId ? (
                            <p className="mt-0.5 truncate font-mono text-xs text-white/40">
                              {lesson.youtubeId}
                            </p>
                          ) : (
                            <span className="mt-0.5 inline-block rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-200">
                              動画準備中
                            </span>
                          )}
                        </div>
                        <form action={deleteLesson}>
                          <input type="hidden" name="id" value={lesson.id} />
                          <input
                            type="hidden"
                            name="courseId"
                            value={course.id}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-red-400/30 px-3 py-1 text-xs text-red-300 transition hover:bg-red-400/10"
                          >
                            削除
                          </button>
                        </form>
                      </li>
                    ))}
                  </ul>
                )}

                {/* レッスン追加 */}
                <AddLessonForm sectionId={section.id} courseId={course.id} />
              </li>
            ))}
          </ul>
        )}

        {/* セクション追加 */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <p className="mb-3 text-sm font-medium text-white">セクション追加</p>
          <AddSectionForm courseId={course.id} />
        </div>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/admin" className="text-white/50 hover:text-white/80">
          ← 管理画面へ戻る
        </Link>
      </p>
    </main>
  );
}
