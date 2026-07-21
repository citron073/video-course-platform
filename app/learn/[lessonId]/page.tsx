import { notFound } from "next/navigation";
import LessonNav from "@/components/LessonNav";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { getAdjacentLessons, getLessonById } from "@/db/queries";
import { COURSE_SLUG } from "@/lib/config";

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

  const { prev, next } = await getAdjacentLessons(COURSE_SLUG, id);

  return (
    <article className="mx-auto max-w-4xl px-4 py-6 sm:px-8 sm:py-10">
      <YouTubeEmbed youtubeId={lesson.youtubeId} title={lesson.title} />

      <h1 className="mt-6 text-2xl font-bold">{lesson.title}</h1>
      {lesson.description && (
        <p className="mt-3 text-white/70 leading-relaxed whitespace-pre-wrap">
          {lesson.description}
        </p>
      )}

      <LessonNav prev={prev} next={next} />
    </article>
  );
}
