import { put } from "@vercel/blob";
import { validateThumbnail } from "@/lib/blob-validate";

/**
 * サムネイル画像の置き場＝Vercel Blob（EP35）。
 *
 * Google ログイン（EP33）と同じ「鍵があるときだけ有効化」パターン。
 * BLOB_READ_WRITE_TOKEN は Vercel ダッシュボード → Storage → Blob で発行して
 * `.env.local`（本番は Vercel 環境変数）に入れる。
 * まだ入れていない間もアプリは起動・ビルドできるようにしてある。
 */

/** アップロードが今使える状態か（UIでinputの出し分け・サーバー側のガードに使う） */
export const isBlobEnabled = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/**
 * サムネイル画像を Vercel Blob にアップロードし、公開URLを返す。
 *
 * - トークン未設定なら明確なエラーを投げる（呼び出し側は isBlobEnabled で事前判定する想定）。
 * - 検証（MIME/サイズ）にも通す（サーバー側の最終防御）。
 */
export async function uploadThumbnail(file: File): Promise<string> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN が未設定です。Vercel の Storage → Blob でトークンを発行し .env.local に設定してください。"
    );
  }

  const check = validateThumbnail({ type: file.type, size: file.size });
  if (!check.ok) {
    throw new Error(check.errors.join(" / "));
  }

  // ファイル名の衝突を避けるため addRandomSuffix を付ける。
  const blob = await put(`thumbnails/${file.name}`, file, {
    access: "public",
    token,
    addRandomSuffix: true,
  });

  return blob.url;
}
