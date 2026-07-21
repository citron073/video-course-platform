# 動画講座プラットフォーム

YouTube限定公開動画を埋め込んだ、1講座・複数レッスン構成の動画講座サイト。
受講者は「Udemy風サイドバー型」UIでレッスンを順番に視聴できる。

## 技術スタック

- **Next.js 16**（App Router / フロント + Server Components）
- **Turso（libSQL）+ Drizzle ORM**（レッスンデータ管理）
- **Tailwind CSS v4**
- **Vercel** にデプロイ想定
- 認証なし（限定公開 = URLを知る人のみアクセス）

## 構成

```
app/
  page.tsx                 講座トップ（概要 + 受講をはじめる）
  learn/
    layout.tsx             サイドバー型レイアウト
    [lessonId]/page.tsx    動画プレーヤー + 前/次ナビ
components/
  YouTubeEmbed.tsx         16:9 レスポンシブ埋め込み（nocookie）
  LessonSidebar.tsx        セクション別レッスン一覧（現在地ハイライト）
  LessonNav.tsx            前/次レッスン
db/
  schema.ts                courses / sections / lessons
  index.ts                 libSQL クライアント + drizzle
  queries.ts               講座・レッスン取得
  seed.ts                  初期データ投入
lib/config.ts              COURSE_SLUG（講座スラッグの単一情報源）
```

データ構造は **講座 → セクション（章）→ レッスン** の3階層。

## セットアップ

```bash
npm install

# 環境変数（ローカルは libSQL のローカルファイルを使う）
cp .env.example .env.local      # TURSO_DATABASE_URL=file:./local.db

# スキーマ反映 → サンプルデータ投入
npm run db:push
npm run seed

# 開発サーバー
npm run dev                     # http://localhost:3000
```

## レッスンの追加・編集

`db/seed.ts` の `COURSE` / `SECTIONS` を編集して `npm run seed` を再実行する
（seed は冪等：実行のたび全削除→再投入）。

```ts
const SECTIONS = [
  {
    title: "第1章 はじめに",
    lessons: [
      { title: "オリエンテーション", youtubeId: "動画ID", description: "..." },
    ],
  },
];
```

### YouTube動画の注意

- 埋め込めるのは **公開** または **限定公開（unlisted）** の動画。
- **非公開（private）** は埋め込み不可。
- `youtubeId` は URL の `v=` の後ろの11文字（例: `https://youtu.be/dQw4w9WgXcQ` → `dQw4w9WgXcQ`）。
- 現在の seed はダミーID（`dQw4w9WgXcQ`）。実際の動画IDに差し替えること。

## Vercel デプロイ

1. Turso でDBを作成（CLIログインが必要・手動）:
   ```bash
   turso db create video-course
   turso db show video-course --url        # → TURSO_DATABASE_URL
   turso db tokens create video-course     # → TURSO_AUTH_TOKEN
   ```
2. ローカルから本番DBへスキーマ反映 + seed（`.env.local` を本番値にして）:
   ```bash
   npm run db:push
   npm run seed
   ```
3. Vercel のプロジェクト環境変数に `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を登録。
4. デプロイ後、ライブで動画再生まで確認する。

## 進捗管理（将来拡張）

v1では未実装。`db/schema.ts` 末尾コメントの `progress` テーブルを追加すれば、
レッスン側を変更せず「視聴済み」「続きから」を後付けできる設計にしてある
（認証なしのため、匿名 `clientId` を localStorage 生成して識別する想定）。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー |
| `npm run db:push` | スキーマをDBへ反映 |
| `npm run db:studio` | Drizzle Studio（DB GUI） |
| `npm run seed` | 初期データ投入 |
| `npm test` | ユニットテスト（Vitest・1回実行） |
| `npm run test:watch` | ユニットテスト（監視モード） |

## テスト

純粋ロジック（`lib/lessons.ts`）を Vitest でユニットテストする。`npm test` で実行。
手順・方針は [`docs/テスト手順.md`](./docs/テスト手順.md)、
**テストを通すためにテスト仕様を変えない**ルールは [`CLAUDE.md`](./CLAUDE.md) を参照。
