/**
 * 指定したメールアドレスのユーザーを管理者(admin)にする。
 *
 * EP34では「MCP経由でAIにroleを書き換えてもらう」のが本筋だが、
 * MCP未接続でも進められるよう手動版を用意した（資料でも手動変更はOKとされている）。
 *
 * 使い方:
 *   npm run make-admin -- you@example.com
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";

config({ path: ".env.local" });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("使い方: npm run make-admin -- you@example.com");
    process.exit(1);
  }

  // .env.local を読んでから db を import する（接続時に環境変数が要るため）
  const { db } = await import("./index");
  const { user } = await import("./schema");

  const found = await db.select().from(user).where(eq(user.email, email));
  if (found.length === 0) {
    console.error(
      `✗ ${email} が見つかりません。先に /login から登録してください。`
    );
    process.exit(1);
  }

  await db.update(user).set({ role: "admin" }).where(eq(user.email, email));

  console.log(`✓ ${email} を admin にしました。`);
  console.log("  → いったんログアウトして、再度ログインすると反映されます。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
