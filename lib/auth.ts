import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/db";

/**
 * Google ログイン（OAuth）を使えるのは、GCPで発行した鍵が両方そろっているときだけ。
 *
 * EP33 の鍵（GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET）はGCPで人間が発行して
 * `.env.local` に入れる。まだ入れていない間もアプリが起動できるよう、
 * ここで「鍵があるときだけ Google を有効化する」形にしている。
 */
const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  // EP32で作った user / account / session / verification を使う
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    },
  }),

  // ログイン状態が本物かを確かめる暗号鍵（合言葉）。
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  // メール+パスワード（鍵なしでも動く。動作確認用）
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // Googleログイン（鍵がある時だけ有効）
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
      }
    : {},

  // EP34: role（立場）を user テーブルに持たせる。
  // input:false = ユーザーが登録時に自分で admin を名乗れないようにする（重要）。
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
});

/** Googleログインが今使える状態か（UIでボタンの出し分けに使う） */
export const isGoogleLoginEnabled = googleEnabled;
