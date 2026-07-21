import { asc, eq } from "drizzle-orm";
import {
  type CourseStructure,
  findAdjacentLessons,
  flattenLessons,
  groupLessonsBySections,
} from "@/lib/lessons";
import { db } from "./index";
import { courses, lessons, sections, type Lesson } from "./schema";

// 純粋ロジックの型は lib/lessons.ts に集約。利用側の利便のため再エクスポート。
export type { CourseStructure, SectionWithLessons } from "@/lib/lessons";

/**
 * 講座 + セクション + レッスンをまとめて取得（サイドバー・トップ共用）。
 * セクション順・レッスン順で整列して返す。該当なしは null。
 */
export async function getCourseWithStructure(
  slug: string
): Promise<CourseStructure | null> {
  const course = await db.query.courses.findFirst({
    where: eq(courses.slug, slug),
  });
  if (!course) return null;

  const sectionRows = await db
    .select()
    .from(sections)
    .where(eq(sections.courseId, course.id))
    .orderBy(asc(sections.order), asc(sections.id));

  const lessonRows = await db
    .select()
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .where(eq(sections.courseId, course.id))
    .orderBy(asc(lessons.order), asc(lessons.id));

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    sections: groupLessonsBySections(
      sectionRows,
      lessonRows.map((row) => row.lessons)
    ),
  };
}

/** 単一レッスン取得。該当なしは null。 */
export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
  });
  return lesson ?? null;
}

/**
 * 講座内の全レッスンをセクション順→レッスン順でフラット化して返す。
 * 前後ナビ・最初のレッスン算出に使う。
 */
export async function getFlatLessons(slug: string): Promise<Lesson[]> {
  const structure = await getCourseWithStructure(slug);
  if (!structure) return [];
  return flattenLessons(structure);
}

/** 指定レッスンの前後レッスン（同一講座のフラット順）。 */
export async function getAdjacentLessons(
  slug: string,
  lessonId: number
): Promise<{ prev: Lesson | null; next: Lesson | null }> {
  const flat = await getFlatLessons(slug);
  return findAdjacentLessons(flat, lessonId);
}
