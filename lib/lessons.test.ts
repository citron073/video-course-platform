import { describe, expect, it } from "vitest";
import type { Lesson, Section } from "@/db/schema";
import {
  type CourseStructure,
  findAdjacentLessons,
  flattenLessons,
  groupLessonsBySections,
} from "@/lib/lessons";

// ---- テスト用ファクトリ ----
function makeSection(id: number, title: string, order: number): Section {
  return { id, courseId: 1, title, order };
}

function makeLesson(id: number, sectionId: number, order: number): Lesson {
  return {
    id,
    sectionId,
    title: `lesson-${id}`,
    youtubeId: "dQw4w9WgXcQ",
    description: null,
    durationSeconds: null,
    order,
  };
}

describe("groupLessonsBySections", () => {
  it("レッスンを正しいセクションに振り分ける", () => {
    const sections = [makeSection(1, "章1", 0), makeSection(2, "章2", 1)];
    const lessons = [
      makeLesson(10, 1, 0),
      makeLesson(11, 1, 1),
      makeLesson(20, 2, 0),
    ];

    const grouped = groupLessonsBySections(sections, lessons);

    expect(grouped).toHaveLength(2);
    expect(grouped[0].lessons.map((l) => l.id)).toEqual([10, 11]);
    expect(grouped[1].lessons.map((l) => l.id)).toEqual([20]);
  });

  it("整列済みの順序をセクション内で保つ", () => {
    const sections = [makeSection(1, "章1", 0)];
    // 入力時点で order 順に整列済みである前提
    const lessons = [makeLesson(10, 1, 0), makeLesson(11, 1, 1), makeLesson(12, 1, 2)];

    const grouped = groupLessonsBySections(sections, lessons);

    expect(grouped[0].lessons.map((l) => l.id)).toEqual([10, 11, 12]);
  });

  it("レッスンが無いセクションは空配列になる", () => {
    const sections = [makeSection(1, "章1", 0), makeSection(2, "空の章", 1)];
    const lessons = [makeLesson(10, 1, 0)];

    const grouped = groupLessonsBySections(sections, lessons);

    expect(grouped[1].lessons).toEqual([]);
  });

  it("レッスンが全く無ければ全セクションが空になる", () => {
    const sections = [makeSection(1, "章1", 0)];
    const grouped = groupLessonsBySections(sections, []);
    expect(grouped[0].lessons).toEqual([]);
  });
});

describe("flattenLessons", () => {
  it("セクション順→レッスン順にフラット化する", () => {
    const structure: CourseStructure = {
      id: 1,
      slug: "main-course",
      title: "講座",
      description: null,
      sections: [
        { ...makeSection(1, "章1", 0), lessons: [makeLesson(10, 1, 0), makeLesson(11, 1, 1)] },
        { ...makeSection(2, "章2", 1), lessons: [makeLesson(20, 2, 0)] },
      ],
    };

    expect(flattenLessons(structure).map((l) => l.id)).toEqual([10, 11, 20]);
  });
});

describe("findAdjacentLessons", () => {
  const flat = [makeLesson(1, 1, 0), makeLesson(2, 1, 1), makeLesson(3, 2, 0)];

  it("中間のレッスンは前後とも返す", () => {
    const { prev, next } = findAdjacentLessons(flat, 2);
    expect(prev?.id).toBe(1);
    expect(next?.id).toBe(3);
  });

  it("最初のレッスンは prev が null", () => {
    const { prev, next } = findAdjacentLessons(flat, 1);
    expect(prev).toBeNull();
    expect(next?.id).toBe(2);
  });

  it("最後のレッスンは next が null", () => {
    const { prev, next } = findAdjacentLessons(flat, 3);
    expect(prev?.id).toBe(2);
    expect(next).toBeNull();
  });

  it("レッスンが1件だけなら前後とも null", () => {
    const { prev, next } = findAdjacentLessons([makeLesson(1, 1, 0)], 1);
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  it("存在しないIDは前後とも null", () => {
    const { prev, next } = findAdjacentLessons(flat, 999);
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });

  it("空配列は前後とも null", () => {
    const { prev, next } = findAdjacentLessons([], 1);
    expect(prev).toBeNull();
    expect(next).toBeNull();
  });
});
