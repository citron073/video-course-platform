"use client";

import { createAuthClient } from "better-auth/react";

/**
 * ブラウザ側からログイン/ログアウトを呼ぶためのクライアント。
 * 画面のボタン（「Googleで続行」「ログイン」）はここ経由で認証APIを叩く。
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
