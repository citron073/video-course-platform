import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/* ============================================================
 * 認証（Better Auth）— EP32/EP33
 *
 * ⚠️ この4テーブルは Better Auth が要求する「決まった名前」。
 *    テーブル名・カラム名（emailVerified の大文字小文字まで）がズレると動かない。
 * ============================================================ */

/**
 * ユーザー本体（誰がいるか）。
 * role = 立場。admin=管理者（講座を投稿・編集できる）／user=一般（受講のみ）。
 */
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" })
    .notNull()
    .default(false),
  image: text("image"),
  // EP34: 管理者バッジ。既定は user（一般）。
  role: text("role").notNull().default("user"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * どのログイン手段か（Google / メール+パスワード）。
 */
export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  // メール+パスワード認証のときだけ入る（ハッシュ済み）。Googleログインでは null。
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * 今ログイン中かどうか（ログインの証）。
 */
export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * メール確認などの検証用。
 */
export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/* ============================================================
 * 講座（コンテンツ）
 * ============================================================ */

/**
 * 講座（コース）。今回は1講座運用だが、将来の複数講座化に備えてテーブルで持つ。
 */
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  // EP34: 公開フラグ。false=下書き（受講者には見えない）／true=公開（棚に並ぶ）。
  published: integer("published", { mode: "boolean" }).notNull().default(false),
  // EP34: 誰が作った講座か（管理者）。
  createdBy: text("created_by").references(() => user.id, {
    onDelete: "set null",
  }),
  // EP35でサムネイル画像（Vercel Blob）を入れる予定。今は未設定=No Image。
  thumbnailUrl: text("thumbnail_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * セクション（章）。1講座に複数。order で並び順を管理。
 */
export const sections = sqliteTable("sections", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
});

/**
 * レッスン（動画）。1セクションに複数。youtubeId は埋め込む YouTube 動画ID。
 */
export const lessons = sqliteTable("lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  youtubeId: text("youtube_id").notNull(),
  description: text("description"),
  durationSeconds: integer("duration_seconds"),
  order: integer("order").notNull().default(0),
});

// 型エクスポート（クエリ層・UIで再利用）
export type User = typeof user.$inferSelect;
export type Session = typeof session.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;

/**
 * 進捗管理は v1 では未実装。将来追加する場合の想定スキーマ:
 *
 *   export const progress = sqliteTable("progress", {
 *     id: integer("id").primaryKey({ autoIncrement: true }),
 *     lessonId: integer("lesson_id").notNull().references(() => lessons.id),
 *     clientId: text("client_id").notNull(), // 認証なしのため匿名ID(localStorage生成)
 *     completed: integer("completed", { mode: "boolean" }).notNull().default(false),
 *     lastPositionSeconds: integer("last_position_seconds").default(0),
 *     updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
 *   });
 *
 * この追加だけで済むよう、lessons 側は進捗に依存しない設計にしている。
 */
