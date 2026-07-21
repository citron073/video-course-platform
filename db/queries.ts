import { asc, eq } from "drizzle-orm";
import {
  type CourseStructure,
  findAdjacentLessons,
  flattenLessons,
  groupLessonsBySections,
} from "@/lib/lessons";
import { db } from "./index";
import {
  courses,
  type Course,
  type Lesson,
  lessons,
  type Section,
  sections,
} from "./schema";

// 純粋ロジックの型は lib/lessons.ts に集約。利用側の利便のため再エクスポート。
export type { CourseStructure, SectionWithLessons } from "@/lib/lessons";

/** 管理画面用: セクション配下にレッスンを持つ形。公開状態に関係なく全件。 */
export type AdminSectionWithLessons = Section & { lessons: Lesson[] };
export type AdminCourseDetail = Course & { sections: AdminSectionWithLessons[] };

/**
 * 管理画面用に、講座 + セクション（order順）+ 各セクションのレッスン（order順）を取得。
 * 公開状態に関わらず取得する（下書きも編集できる）。該当なしは null。
 */
export async function getCourseForAdmin(
  id: number
): Promise<AdminCourseDetail | null> {
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, id),
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

  const bySection = new Map<number, Lesson[]>();
  for (const row of lessonRows) {
    const lesson = row.lessons;
    const list = bySection.get(lesson.sectionId) ?? [];
    list.push(lesson);
    bySection.set(lesson.sectionId, list);
  }

  return {
    ...course,
    sections: sectionRows.map((section) => ({
      ...section,
      lessons: bySection.get(section.id) ?? [],
    })),
  };
}

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
 * レッスンが属する講座の slug を返す（該当なしは null）。
 * 講座は固定でなく、レッスンID → セクション → 講座 の順で解決する。
 * これにより、管理画面で作った任意 slug の講座でも受講ページが成立する。
 */
export async function getCourseSlugByLessonId(
  lessonId: number
): Promise<string | null> {
  const rows = await db
    .select({ slug: courses.slug })
    .from(lessons)
    .innerJoin(sections, eq(lessons.sectionId, sections.id))
    .innerJoin(courses, eq(sections.courseId, courses.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  return rows[0]?.slug ?? null;
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
