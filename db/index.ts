import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL が未設定です。.env.local を確認してください（例: file:./local.db）。"
  );
}

const client = createClient({
  url,
  // 本番(Turso リモート)のみ authToken が必要。ローカル file: では undefined でよい。
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
export { schema };
