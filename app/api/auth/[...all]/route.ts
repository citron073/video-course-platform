import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * 認証の受付窓口。
 * ログイン・ログアウト・Googleからの戻り（コールバック）を全部ここが受ける。
 *
 * ⚠️ GCPの「承認済みのリダイレクトURI」には、このパスを完全一致で登録する:
 *    http://localhost:3000/api/auth/callback/google
 */
export const { GET, POST } = toNextJsHandler(auth);
