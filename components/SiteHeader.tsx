import Link from "next/link";
import { canAccessAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "./SignOutButton";

/**
 * 全ページ共通ヘッダー（ダークテーマ）。
 * ログイン状態と、管理者だけに見える「管理画面」リンクを出す。
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f17]/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-bold text-white"
        >
          <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-500 text-xs">
            ▶
          </span>
          動画講座
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {user ? (
            <>
              {/* EP34: adminバッジを持つ人にだけ管理画面リンクが出現する */}
              {canAccessAdmin(user) && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-400"
                >
                  管理画面
                </Link>
              )}
              <span className="hidden text-xs text-white/60 sm:inline">
                {user.name || user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:bg-white/5"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
