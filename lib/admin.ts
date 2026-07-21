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

/**
 * http / https の URL かどうか。空文字・その他スキーム(ftp等)は false。
 * サムネイルURL欄の検証に使う。
 */
export function isValidHttpUrl(url: string): boolean {
  const value = (url ?? "").trim();
  if (!value) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * YouTube の URL（各種形式）や裸のIDから 11文字の動画IDを取り出す。
 * - 空 / 空白のみ → ""（動画なし）
 * - watch?v= / youtu.be/ / youtube-nocookie.com/embed/ / youtube.com/embed/ に対応
 * - 裸の11文字ID → そのまま
 * - どれにも当てはまらなければ trim した入力をそのまま返す（後段でそのまま保存）
 */
export function extractYouTubeId(input: string): string {
  const value = (input ?? "").trim();
  if (!value) return "";

  const idPattern = /^[A-Za-z0-9_-]{11}$/;

  // 裸の11文字ID
  if (idPattern.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");

    // https://youtu.be/XXXX
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      if (idPattern.test(id)) return id;
    }

    // youtube.com / youtube-nocookie.com
    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      // watch?v=XXXX
      const v = url.searchParams.get("v");
      if (v && idPattern.test(v)) return v;

      // /embed/XXXX, /v/XXXX, /shorts/XXXX
      const segments = url.pathname.split("/").filter(Boolean);
      const marker = segments.findIndex((s) =>
        ["embed", "v", "shorts"].includes(s)
      );
      if (marker !== -1) {
        const id = segments[marker + 1] ?? "";
        if (idPattern.test(id)) return id;
      }
    }
  } catch {
    // URL でなければ下に落ちる
  }

  // 取れなければ入力をそのまま返す
  return value;
}

export type CourseInput = {
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
};

export type ValidationResult =
  | { ok: true; value: CourseInput }
  | { ok: false; errors: string[] };

/**
 * 講座作成フォームの検証。
 * タイトル必須／スラッグは形式チェック（重複チェックはDB側の unique 制約に任せる）。
 * thumbnailUrl は任意。空なら null、非空なら http(s) URL のみ許可。
 */
export function validateCourseInput(input: {
  title?: string | null;
  slug?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
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

  // サムネイルURL（任意）。入力があれば http(s) URL であることをチェック。
  const rawThumb = (input.thumbnailUrl ?? "").trim();
  let thumbnailUrl: string | null = null;
  if (rawThumb) {
    if (!isValidHttpUrl(rawThumb)) {
      errors.push("サムネイルは http(s) の画像URLを入力してください");
    } else {
      thumbnailUrl = rawThumb;
    }
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      title,
      slug,
      description: (input.description ?? "").trim() || null,
      thumbnailUrl,
    },
  };
}

export type SectionInputValue = { title: string };

export type SectionValidationResult =
  | { ok: true; value: SectionInputValue }
  | { ok: false; errors: string[] };

/**
 * セクション（章）入力の検証。タイトル必須・100字以内。
 */
export function validateSectionInput(input: {
  title?: string | null;
}): SectionValidationResult {
  const errors: string[] = [];

  const title = (input.title ?? "").trim();
  if (!title) errors.push("セクション名を入力してください");
  if (title.length > 100) errors.push("セクション名は100文字以内にしてください");

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { title } };
}

export type LessonInputValue = { title: string; youtubeId: string };

export type LessonValidationResult =
  | { ok: true; value: LessonInputValue }
  | { ok: false; errors: string[] };

/**
 * レッスン入力の検証。タイトル必須・200字以内。
 * youtubeId は extractYouTubeId を通し、任意（空文字OK＝動画なし）。
 */
export function validateLessonInput(input: {
  title?: string | null;
  youtubeId?: string | null;
}): LessonValidationResult {
  const errors: string[] = [];

  const title = (input.title ?? "").trim();
  if (!title) errors.push("レッスン名を入力してください");
  if (title.length > 200) errors.push("レッスン名は200文字以内にしてください");

  const youtubeId = extractYouTubeId(input.youtubeId ?? "");

  if (errors.length > 0) return { ok: false, errors };

  return { ok: true, value: { title, youtubeId } };
}
