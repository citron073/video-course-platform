"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { canAccessAdmin, validateCourseInput } from "@/lib/admin";
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
  });

  if (!parsed.ok) return { errors: parsed.errors };

  // サムネイル画像（EP35）: Blob有効かつファイルがあればアップロードしてURLを得る。
  // 未設定時は input が無効なので通常 file は来ないが、防御的に isBlobEnabled でガードする。
  let thumbnailUrl: string | null = null;
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
