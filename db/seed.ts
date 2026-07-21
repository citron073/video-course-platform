import { config } from "dotenv";
config({ path: ".env.local" });

// 注意: dotenv より先に db/index.ts が評価されないよう、db は main() 内で動的importする。
import { courses, lessons, sections } from "./schema";

/**
 * 初期データ投入スクリプト。
 *   npm run seed
 *
 * 注意: youtubeId はダミー（差し替え前提）。
 *   - 埋め込みできるのは「公開」または「限定公開(unlisted)」の動画。
 *   - 「非公開(private)」は埋め込み不可。
 *   実際の動画IDに置き換えてから再 seed すること。
 */

// ---- ここを編集して講座内容を定義 ----
const COURSE = {
  slug: "main-course",
  title: "サンプル動画講座",
  description:
    "YouTube限定公開動画を使った講座のサンプルです。セクションとレッスンを seed で管理します。",
};

const SECTIONS: {
  title: string;
  lessons: { title: string; youtubeId: string; description?: string }[];
}[] = [
  {
    title: "第1章 はじめに",
    lessons: [
      {
        title: "オリエンテーション",
        youtubeId: "dQw4w9WgXcQ",
        description: "講座の全体像と進め方を説明します。",
      },
      {
        title: "環境準備",
        youtubeId: "dQw4w9WgXcQ",
        description: "受講に必要な準備を整えます。",
      },
    ],
  },
  {
    title: "第2章 基礎",
    lessons: [
      {
        title: "基本の考え方",
        youtubeId: "dQw4w9WgXcQ",
        description: "土台となる概念を学びます。",
      },
      {
        title: "実践してみる",
        youtubeId: "dQw4w9WgXcQ",
        description: "手を動かして理解を深めます。",
      },
      {
        title: "よくあるつまずき",
        youtubeId: "dQw4w9WgXcQ",
        description: "初学者が陥りやすいポイントを整理します。",
      },
    ],
  },
  {
    title: "第3章 まとめ",
    lessons: [
      {
        title: "総まとめと次のステップ",
        youtubeId: "dQw4w9WgXcQ",
        description: "学んだ内容を振り返り、次に進む道筋を示します。",
      },
    ],
  },
];
// ------------------------------------

async function main() {
  console.log("🌱 seed 開始");
  const { db } = await import("./index");

  // 冪等にするため既存データを削除（cascade で sections / lessons も消える）
  await db.delete(lessons);
  await db.delete(sections);
  await db.delete(courses);

  const [course] = await db
    .insert(courses)
    .values({
      slug: COURSE.slug,
      title: COURSE.title,
      description: COURSE.description,
    })
    .returning();

  console.log(`  講座を作成: ${course.title} (id=${course.id})`);

  for (let s = 0; s < SECTIONS.length; s++) {
    const sec = SECTIONS[s];
    const [section] = await db
      .insert(sections)
      .values({ courseId: course.id, title: sec.title, order: s })
      .returning();

    for (let l = 0; l < sec.lessons.length; l++) {
      const les = sec.lessons[l];
      await db.insert(lessons).values({
        sectionId: section.id,
        title: les.title,
        youtubeId: les.youtubeId,
        description: les.description ?? null,
        order: l,
      });
    }
    console.log(`  セクション「${sec.title}」: ${sec.lessons.length} レッスン`);
  }

  console.log("✅ seed 完了");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ seed 失敗:", err);
    process.exit(1);
  });
