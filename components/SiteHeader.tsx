import Link from "next/link";
import { canAccessAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { SignOutButton } from "./SignOutButton";

/**
 * 全ページ共通ヘッダー。
 * ログイン状態と、管理者だけに見える「管理画面」リンクを出す。
 */
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-gray-200">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-sm font-bold">
          動画講座
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              {/* EP34: adminバッジを持つ人にだけ管理画面リンクが出現する */}
              {canAccessAdmin(user) && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white"
                >
                  管理画面
                </Link>
              )}
              <span className="hidden text-xs text-gray-500 sm:inline">
                {user.name || user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
            >
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
