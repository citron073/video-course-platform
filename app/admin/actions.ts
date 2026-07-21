"use server";

import { eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { courses, lessons, sections } from "@/db/schema";
import {
  canAccessAdmin,
  validateCourseInput,
  validateLessonInput,
  validateSectionInput,
} from "@/lib/admin";
import { isBlobEnabled, uploadThumbnail } from "@/lib/blob";
import { validateThumbnail } from "@/lib/blob-validate";
import { getCurrentUser } from "@/lib/session";

export type ActionState = { errors: string[] } | null;

/**
 * 講座を作成する。
 *
 * ⚠️ 権限チェックはここ（サーバー側）で必ずやる。
 *    画面でボタンを隠すのは"見た目"であって、防御にはならない。
 */
export async function createCourse(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return { errors: ["権限がありません（管理者のみ作成できます）"] };
  }

  const parsed = validateCourseInput({
    title: formData.get("title") as string | null,
    slug: formData.get("slug") as string | null,
    description: formData.get("description") as string | null,
    thumbnailUrl: formData.get("thumbnailUrl") as string | null,
  });

  if (!parsed.ok) return { errors: parsed.errors };

  // サムネイル画像（EP35）: Blob有効かつファイルがあればアップロードしてURLを優先。
  // ファイルが無ければURL欄（validateCourseInput 済み）を使う。
  let thumbnailUrl: string | null = parsed.value.thumbnailUrl ?? null;
  const thumbnail = formData.get("thumbnail");
  if (isBlobEnabled && thumbnail instanceof File && thumbnail.size > 0) {
    const check = validateThumbnail({
      type: thumbnail.type,
      size: thumbnail.size,
    });
    if (!check.ok) return { errors: check.errors };

    try {
      thumbnailUrl = await uploadThumbnail(thumbnail);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return { errors: [`画像アップロードに失敗しました: ${message}`] };
    }
  }

  try {
    await db.insert(courses).values({
      title: parsed.value.title,
      slug: parsed.value.slug,
      description: parsed.value.description,
      published: formData.get("published") === "on",
      createdBy: user!.id,
      thumbnailUrl,
    });
  } catch (e) {
    // スラッグ重複（unique制約）が典型
    const message = e instanceof Error ? e.message : String(e);
    if (message.includes("UNIQUE") || message.includes("unique")) {
      return {
        errors: [
          "このスラッグは既に使われています。別の値にしてください（スラッグは重複NG）",
        ],
      };
    }
    return { errors: [`保存に失敗しました: ${message}`] };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

/**
 * 講座を更新する（タイトル・説明・サムネURL・公開フラグ）。
 * slug は変更不可（既存値をそのまま検証に渡す）。
 */
export async function updateCourse(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) {
    return { errors: ["権限がありません（管理者のみ編集できます）"] };
  }

  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return { errors: ["不正なIDです"] };

  const existing = await db.query.courses.findFirst({
    where: eq(courses.id, id),
  });
  if (!existing) return { errors: ["講座が見つかりません"] };

  const parsed = validateCourseInput({
    title: formData.get("title") as string | null,
    slug: existing.slug, // slug は変更不可
    description: formData.get("description") as string | null,
    thumbnailUrl: formData.get("thumbnailUrl") as string | null,
  });

  if (!parsed.ok) return { errors: parsed.errors };

  try {
    await db
      .update(courses)
      .set({
        title: parsed.value.title,
        description: parsed.value.description,
        thumbnailUrl: parsed.value.thumbnailUrl ?? null,
        published: formData.get("published") === "on",
      })
      .where(eq(courses.id, id));
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { errors: [`保存に失敗しました: ${message}`] };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${id}`);
  revalidatePath("/");
  revalidatePath("/learn");
  return null;
}

/** 公開 / 下書き を切り替える */
export async function togglePublish(formData: FormData) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) return;

  const id = Number(formData.get("id"));
  const next = formData.get("next") === "true";
  if (!Number.isFinite(id)) return;

  await db.update(courses).set({ published: next }).where(eq(courses.id, id));

  revalidatePath("/admin");
  revalidatePath("/");
}

/** セクション（章）を追加する。order は当該コースの既存最大+1。 */
export async function createSection(formData: FormData) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) return;

  const courseId = Number(formData.get("courseId"));
  if (!Number.isFinite(courseId)) return;

  const parsed = validateSectionInput({
    title: formData.get("title") as string | null,
  });
  if (!parsed.ok) return;

  const [row] = await db
    .select({ maxOrder: max(sections.order) })
    .from(sections)
    .where(eq(sections.courseId, courseId));
  const nextOrder = (row?.maxOrder ?? -1) + 1;

  await db.insert(sections).values({
    courseId,
    title: parsed.value.title,
    order: nextOrder,
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
  revalidatePath("/learn");
}

/**
 * セクションを削除する。
 * Turso/libSQL では FK cascade が効かない前提で、先に配下レッスンを消す。
 */
export async function deleteSection(formData: FormData) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) return;

  const id = Number(formData.get("id"));
  const courseId = Number(formData.get("courseId"));
  if (!Number.isFinite(id)) return;

  await db.delete(lessons).where(eq(lessons.sectionId, id));
  await db.delete(sections).where(eq(sections.id, id));

  revalidatePath("/admin");
  if (Number.isFinite(courseId)) {
    revalidatePath(`/admin/courses/${courseId}`);
  }
  revalidatePath("/");
  revalidatePath("/learn");
}

/** レッスンを追加する。order は当該セクションの既存最大+1。youtubeId は空OK（動画なし）。 */
export async function createLesson(formData: FormData) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) return;

  const sectionId = Number(formData.get("sectionId"));
  const courseId = Number(formData.get("courseId"));
  if (!Number.isFinite(sectionId)) return;

  const parsed = validateLessonInput({
    title: formData.get("title") as string | null,
    youtubeId: formData.get("youtubeId") as string | null,
  });
  if (!parsed.ok) return;

  const description = (
    (formData.get("description") as string | null) ?? ""
  ).trim();

  const [row] = await db
    .select({ maxOrder: max(lessons.order) })
    .from(lessons)
    .where(eq(lessons.sectionId, sectionId));
  const nextOrder = (row?.maxOrder ?? -1) + 1;

  await db.insert(lessons).values({
    sectionId,
    title: parsed.value.title,
    youtubeId: parsed.value.youtubeId, // 空文字OK（notNullのまま動画なしを表現）
    description: description || null,
    order: nextOrder,
  });

  revalidatePath("/admin");
  if (Number.isFinite(courseId)) {
    revalidatePath(`/admin/courses/${courseId}`);
  }
  revalidatePath("/");
  revalidatePath("/learn");
}

/** レッスンを削除する。 */
export async function deleteLesson(formData: FormData) {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) return;

  const id = Number(formData.get("id"));
  const courseId = Number(formData.get("courseId"));
  if (!Number.isFinite(id)) return;

  await db.delete(lessons).where(eq(lessons.id, id));

  revalidatePath("/admin");
  if (Number.isFinite(courseId)) {
    revalidatePath(`/admin/courses/${courseId}`);
  }
  revalidatePath("/");
  revalidatePath("/learn");
}
