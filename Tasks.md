# Tasks

> プロジェクトのタスク台帳（チェックリスト）。実装・テストが1つ完了するたびに更新する。
> 詳細な経緯は [`docs/進捗記録.md`](./docs/進捗記録.md)、残作業の再開手順は [`docs/未実行タスク.md`](./docs/未実行タスク.md)。
> 運用ルールは [`CLAUDE.md`](./CLAUDE.md)（着手前にdocs確認 → 完了後にこのファイルを更新）。

最終更新: 2026-07-21 (JST)  ※このディレクトリは EP31-34 のゼミ練習用コピー

## 完了

- [x] Next.js 16 プロジェクト初期化（手動スキャフォールド） — 2026-06-28
- [x] DBスキーマ（courses / sections / lessons）+ libSQLクライアント — 2026-06-28
- [x] seedスクリプト（冪等・3セクション6レッスン） — 2026-06-28
- [x] クエリ層（講座構造取得・前後ナビ） — 2026-06-28
- [x] 講座トップ画面（`app/page.tsx`） — 2026-06-28
- [x] サイドバー型レイアウト + レッスンページ + YouTube埋め込み — 2026-06-28
- [x] README / docs 一式（実装プラン・進捗記録・未実行タスク・運用手順） — 2026-06-28
- [x] 純粋ロジック切り出し（`lib/lessons.ts`）+ ユニットテスト（Vitest 11ケース） — 2026-06-28
- [x] テストの鉄則 + 作業フローを `CLAUDE.md` に明文化 — 2026-06-28
- [x] `Tasks.md` 台帳の新設 — 2026-06-28
- [x] 横展開ガイド作成（指示→実行の対応表・再利用テンプレ） — 2026-06-28
- [x] 横断正本化: `~/.claude/knowledge/project_build_playbook.md` 新設＋playbook武器8登録 — 2026-06-28

## 完了（EP31〜34 ゼミ練習 / 2026-07-20）

- [x] EP32: Better Auth スキーマ4テーブル（user/account/session/verification）+ role 追加 — 2026-07-20
- [x] EP32: courses に published / createdBy / thumbnailUrl を追加、`db:push` でローカルDBに反映 — 2026-07-20
- [x] EP33: Better Auth 本体配線（`lib/auth.ts`）＋ 認証APIルート（`/api/auth/[...all]`） — 2026-07-20
- [x] EP33: Googleプロバイダを「鍵がある時だけ有効化」する実装（鍵なしでも起動可能） — 2026-07-20
- [x] EP33: ログイン画面（メール+パスワード / Googleボタン出し分け） — 2026-07-20
- [x] EP34: role判定の純粋ロジック（`lib/admin.ts`）+ テスト22ケース — 2026-07-20
- [x] EP34: 管理画面 `/admin`（admin以外はブロック）・コース作成 `/admin/courses/new`・公開/下書き切替 — 2026-07-20
- [x] EP34: トップを「公開講座一覧」に変更（下書きは受講者に非表示・管理者のみ可視） — 2026-07-20
- [x] EP34: `npm run make-admin -- <email>`（MCP未接続でもrole変更できる手動版） — 2026-07-20
- [x] EP31: `mcp.json.example` 雛形作成 + `.gitignore` に `mcp.json` 追加（鍵の持ち出し禁止） — 2026-07-20
- [x] 動作確認: 登録→DB保存→admin昇格→講座作成→公開/下書き制御 までブラウザで通した — 2026-07-20

- [x] EP34（クラウド）: tani-cloud を admin化 → 講座作成・公開をクラウドDBで動作確認 — 2026-07-21

- [x] EP36準備: git初期化→Public Repo作成→push（https://github.com/citron073/video-course-platform） — 2026-07-21
- [ ] EP36: Vercelアカウント作成→インポート→環境変数設定→デプロイ→公開URL取得（本人・docs/EP36_デプロイ手順.md）

- [x] EP38: 全ページをダークテーマに統一＋画像表示を堅牢化（No Imageアイコン/遅延読込/管理一覧サムネ枠） — 2026-07-21

## 未着手（たにさん本人の作業＝鍵の受け渡し）

- [ ] **EP31: Turso アカウント作成 → Platform API Token 発行 → `mcp.json` に記入**（AIには渡さない）
- [ ] EP31: `/mcp` で Turso が `Connected` になることを確認
- [x] EP32: Turso 東京グループ`video-course`＋DB`video-course-platform`作成 → `.env.local`をクラウド接続に切替 → db:push で7テーブル生成 → 登録がクラウドに残ることを確認 — 2026-07-21（Platform API経由）
- [x] EP33: GCPでOAuth鍵発行 → `.env.local`設定 → 「Googleで続行」有効化 → Google認証画面への遷移を確認 — 2026-07-21
- [x] EP33: リダイレクトURI完全一致で通過を確認 — 2026-07-21
- [ ] EP34: 自分のGoogleアカウントで登録後 `npm run make-admin -- <自分のメール>` で admin 化
- [x] EP35: サムネイル画像の置き場（Vercel Blob）— 鍵待ちでも動く設計（`isBlobEnabled`）で実装。`lib/blob.ts` / `lib/blob-validate.ts`(+test15) / フォームinput / 一覧表示(No Image) / `.env.example`追記。build成功・test48 green — 2026-07-21
  - [ ] EP35: `BLOB_READ_WRITE_TOKEN` 発行（Vercel Storage → Blob）→ `.env.local` 設定 → 実アップロード動作確認（AIには渡さない・人間の手作業）
- [x] 管理画面フル化: コース編集（タイトル/説明/サムネURL/公開）＋セクション/レッスンのCRUD。サムネはURL入力主体（Blobファイルは来れば優先）。動画なしレッスンは `youtubeId=""`（スキーマ変更なし）で表現し受講画面は「動画準備中」表示。`lib/admin.ts`(+isValidHttpUrl/extractYouTubeId/validateSection/validateLesson/thumbnail対応)・test66 green・build成功 — 2026-07-22

## 未着手 / 進行中（優先度: 高 = 公開までに必須）

- [ ] 動画IDの差し替え（ダミー→実際の限定公開動画ID → `npm run seed`）
- [ ] 講座タイトル・説明・章立ての確定（`db/seed.ts` の `COURSE` / `SECTIONS`）
- [ ] Vercelデプロイ（Turso DB作成 → 環境変数登録 → ライブで再生確認）

## 未着手（優先度: 中）

- [ ] localStorage 簡易進捗（視聴済み✓表示）
- [ ] デザイン調整（ブランドカラー/ロゴ/フォント）
- [ ] テスト拡充（結合テスト=in-memory libSQL／E2E=Playwright）

## 未着手（優先度: 低）

- [ ] レッスン動画尺（`durationSeconds`）をサイドバー表示
- [ ] 講座サムネイル / OGP画像
- [ ] 複数講座対応（`lib/config.ts` 起点）

## 確認待ち（たにさんへ）

- [ ] 実際の動画ID・講座文言の有無
- [ ] 公開時期・独自ドメインの有無
