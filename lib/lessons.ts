import type { Lesson, Section } from "@/db/schema";

/**
 * レッスンまわりの純粋ロジック（DB非依存）。
 * ここに入出力の副作用を持たない関数だけを置くことで、env/DBなしで単体テストできる。
 * DBアクセスは db/queries.ts 側が担当し、整列済みデータをここへ渡す。
 */

export type SectionWithLessons = Section & { lessons: Lesson[] };

export type CourseStructure = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  sections: SectionWithLessons[];
};

/**
 * セクション配列とレッスン配列を「セクション → そのレッスン群」にまとめる。
 * 前提: sectionRows は表示順、orderedLessons は表示順で整列済み。
 * （ソート済み配列をバケットに振り分けるため、各セクション内の順序は保たれる）
 */
export function groupLessonsBySections(
  sectionRows: Section[],
  orderedLessons: Lesson[]
): SectionWithLessons[] {
  const bySection = new Map<number, Lesson[]>();
  for (const lesson of orderedLessons) {
    const list = bySection.get(lesson.sectionId) ?? [];
    list.push(lesson);
    bySection.set(lesson.sectionId, list);
  }
  return sectionRows.map((section) => ({
    ...section,
    lessons: bySection.get(section.id) ?? [],
  }));
}

/** 講座構造をナビゲーション順（セクション順→レッスン順）にフラット化する。 */
export function flattenLessons(structure: CourseStructure): Lesson[] {
  return structure.sections.flatMap((section) => section.lessons);
}

/**
 * フラット化済みレッスン列の中で、指定レッスンの前後を返す。
 * 端では該当側を null、見つからなければ両方 null。
 */
export function findAdjacentLessons(
  flatLessons: Lesson[],
  lessonId: number
): { prev: Lesson | null; next: Lesson | null } {
  const idx = flatLessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flatLessons[idx - 1] : null,
    next: idx < flatLessons.length - 1 ? flatLessons[idx + 1] : null,
  };
}
