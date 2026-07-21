import { desc } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { courses } from "@/db/schema";
import { canAccessAdmin } from "@/lib/admin";
import { getCurrentUser } from "@/lib/session";
import { togglePublish } from "./actions";

export const metadata = { title: "管理画面 | 動画講座" };

export default async function AdminPage() {
  const user = await getCurrentUser();

  // 未ログインはログインへ
  if (!user) redirect("/login");

  // ログイン済みでも role=user なら入れない（EP34の肝）
  if (!canAccessAdmin(user)) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-xl font-bold">管理者専用ページです</h1>
        <p className="mt-3 text-sm text-gray-600">
          今のあなたの立場は <code className="font-mono">role = {user.role}</code>{" "}
          です。講座を投稿できるのは <code className="font-mono">admin</code>{" "}
          だけです。
        </p>
        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
          <p className="font-medium">自分を管理者にするには（EP34）</p>
          <p className="mt-2">
            Claude Code に、MCP経由で下記を頼みます。
          </p>
          <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
{`講座を投稿する管理者は ${user.email} です。
MCP 経由で、このユーザーの role を admin に変更してください。`}
          </pre>
          <p className="mt-2 text-xs text-gray-500">
            ローカルDBなら次のコマンドでも変更できます：
            <br />
            <code className="font-mono">npm run make-admin -- {user.email}</code>
          </p>
          <p className="mt-2 text-xs text-gray-500">
            変更したら、いったんログアウト → 再ログインすると反映されます。
          </p>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-gray-500 hover:underline">
            ← 講座トップへ
          </Link>
        </p>
      </main>
    );
  }

  const list = await db.select().from(courses).orderBy(desc(courses.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">管理画面</h1>
          <p className="mt-1 text-sm text-gray-500">
            {user.name}（{user.email}）／ role = {user.role}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
        >
          ＋ コース作成
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-gray-500">
          講座一覧（{list.length}件）
        </h2>

        {list.length === 0 ? (
          <p className="mt-4 rounded-lg bg-gray-50 p-6 text-sm text-gray-600">
            まだ講座がありません。「＋ コース作成」から1つ作ってみましょう。
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((course) => (
              <li
                key={course.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{course.title}</p>
                  <p className="mt-1 truncate font-mono text-xs text-gray-500">
                    /{course.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      course.published
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {course.published ? "公開中" : "下書き"}
                  </span>
                  <form action={togglePublish}>
                    <input type="hidden" name="id" value={course.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={String(!course.published)}
                    />
                    <button
                      type="submit"
                      className="rounded-lg border border-gray-300 px-3 py-1 text-xs hover:bg-gray-50"
                    >
                      {course.published ? "下書きに戻す" : "公開する"}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-10 text-sm">
        <Link href="/" className="text-gray-500 hover:underline">
          ← 講座トップへ
        </Link>
      </p>
    </main>
  );
}
