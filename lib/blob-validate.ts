/**
 * サムネイル画像のファイル検証（純粋ロジック）。
 * DB・env・@vercel/blob に依存させない（テスト対象）。
 *
 * ここでは「どんな画像を受け付けるか」だけを決める。
 * 実際のアップロード（ネット・トークン）は lib/blob.ts が担当する。
 */

/** 受け付ける画像の MIME タイプ（拡張子ではなく Content-Type で判定する） */
export const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
] as const;

/** サイズ上限の既定値（MB）。5MB を超える画像は弾く。 */
export const DEFAULT_MAX_MB = 5;

/**
 * 許可された画像 MIME か。
 * 大文字・前後空白でズレないよう正規化してから判定する。
 */
export function isAllowedImageType(mime: string | null | undefined): boolean {
  if (!mime) return false;
  const normalized = mime.trim().toLowerCase();
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(normalized);
}

/**
 * サイズが上限以内か（境界＝ちょうど上限はOK）。
 * bytes が 0 以下や数値でない場合は不正として false。
 */
export function isWithinSizeLimit(
  bytes: number,
  maxMB: number = DEFAULT_MAX_MB
): boolean {
  if (!Number.isFinite(bytes) || bytes <= 0) return false;
  const maxBytes = maxMB * 1024 * 1024;
  return bytes <= maxBytes;
}

export type ThumbnailValidationResult =
  | { ok: true }
  | { ok: false; errors: string[] };

/**
 * サムネイル画像の総合検証（MIME＋サイズ）。
 * File そのものではなく { type, size } だけ渡せるようにして、
 * DB/env 非依存・テスト容易にしている。
 */
export function validateThumbnail(
  file: { type: string | null | undefined; size: number },
  maxMB: number = DEFAULT_MAX_MB
): ThumbnailValidationResult {
  const errors: string[] = [];

  if (!isAllowedImageType(file.type)) {
    errors.push(
      "画像は PNG / JPEG / WebP / GIF のみアップロードできます"
    );
  }

  if (!isWithinSizeLimit(file.size, maxMB)) {
    errors.push(`画像サイズは ${maxMB}MB 以内にしてください`);
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true };
}
