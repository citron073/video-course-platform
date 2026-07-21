import { notFound } from "next/navigation";
import LessonNav from "@/components/LessonNav";
import LessonSidebar from "@/components/LessonSidebar";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import {
  getAdjacentLessons,
  getCourseSlugByLessonId,
  getCourseWithStructure,
  getLessonById,
} from "@/db/queries";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const id = Number(lessonId);
  if (!Number.isInteger(id)) notFound();

  const lesson = await getLessonById(id);
  if (!lesson) notFound();

  // 講座は固定せず、レッスンから解決する（管理画面で作った任意slugの講座に対応）
  const slug = await getCourseSlugByLessonId(id);
  if (!slug) notFound();

  const course = await getCourseWithStructure(slug);
  if (!course) notFound();

  const { prev, next } = await getAdjacentLessons(slug, id);

  const hasVideo = Boolean(lesson.youtubeId && lesson.youtubeId.trim());

  return (
    <div className="md:grid md:h-[calc(100vh-57px)] md:grid-cols-[300px_1fr]">
      <LessonSidebar structure={course} />

      <main className="md:h-[calc(100vh-57px)] md:overflow-y-auto">
        <article className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
          {hasVideo ? (
            <YouTubeEmbed youtubeId={lesson.youtubeId} title={lesson.title} />
          ) : (
            <div className="grid aspect-video w-full place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-center">
              <div>
                <p className="text-lg font-medium text-white/70">動画準備中</p>
                <p className="mt-1 text-sm text-white/40">
                  管理画面からYouTube動画を設定できます。
                </p>
              </div>
            </div>
          )}

          <h1 className="mt-6 text-2xl font-bold text-white">{lesson.title}</h1>
          {lesson.description && (
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-white/70">
              {lesson.description}
            </p>
          )}

          <LessonNav prev={prev} next={next} />
        </article>
      </main>
    </div>
  );
}
