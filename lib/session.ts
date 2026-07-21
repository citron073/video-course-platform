import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/**
 * 今ログインしている人を取り出す（Server Component / Server Action 用）。
 * 未ログインなら null。
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  // role は additionalFields で足したもの。型に出ないケースがあるため明示的に取り出す。
  const role = (session.user as { role?: string | null }).role ?? "user";
  return { ...session.user, role };
}
