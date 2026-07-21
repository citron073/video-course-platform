import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// .env.local を読み込む（Next.js は自動で読むが、drizzle-kit CLI は別プロセスのため明示）
config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
