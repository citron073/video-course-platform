/**
 * 権限（role）と講座入力の純粋ロジック。
 * DB・envに依存させない（テスト対象）。
 */

/** 立場（ロール） */
export const ROLE_ADMIN = "admin";
export const ROLE_USER = "user";

export type Role = typeof ROLE_ADMIN | typeof ROLE_USER;

/**
 * 管理者かどうか。
 * 未ログイン(null/undefined)・不明な値は false（＝入れない）に倒す。
 */
export function isAdmin(role: string | null | undefined): boolean {
  return role === ROLE_ADMIN;
}

/**
 * 管理画面に入れるか。
 * ログインしていて、かつ role が admin のときだけ true。
 */
export function canAccessAdmin(
  user: { role?: string | null } | null | undefined
): boolean {
  if (!user) return false;
  return isAdmin(user.role);
}

/**
 * 講座が受講者の一覧に出るか。
 * 公開フラグが true のものだけ棚に並ぶ（下書きは出さない）。
 * ただし管理者は下書きも見える。
 */
export function isVisibleToViewer(
  course: { published: boolean },
  viewerRole?: string | null
): boolean {
  return course.published || isAdmin(viewerRole);
}

/**
 * スラッグ（URL用の短い文字列）として使えるか。
 * 小文字英数字とハイフンのみ。先頭末尾のハイフン・連続ハイフンは不可。
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}

/**
 * 入力文字列をスラッグの形に整える。
 * 例: "Claude Code 入門!" → "claude-code"
 */
export function normalizeSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CourseInput = {
  title: string;
  slug: string;
  description?: string | null;
};

export type ValidationResult =
  | { ok: true; value: CourseInput }
  | { ok: false; errors: string[] };

/**
 * 講座作成フォームの検証。
 * タイトル必須／スラッグは形式チェック（重複チェックはDB側の unique 制約に任せる）。
 */
export function validateCourseInput(input: {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
}): ValidationResult {
  const errors: string[] = [];

  const title = (input.title ?? "").trim();
  if (!title) errors.push("タイトルを入力してください");
  if (title.length > 200) errors.push("タイトルは200文字以内にしてください");

  // スラッグ未入力ならタイトルから自動生成する
  const rawSlug = (input.slug ?? "").trim();
  const slug = rawSlug ? rawSlug.toLowerCase() : normalizeSlug(title);
  if (!slug) {
    errors.push("スラッグを入力してください（URLに使う英数字）");
  } else if (!isValidSlug(slug)) {
    errors.push(
      "スラッグは小文字の英数字とハイフンのみ使えます（例: claude-code-intro）"
    );
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      slug,
      description: (input.description ?? "").trim() || null,
    },
  };
}
