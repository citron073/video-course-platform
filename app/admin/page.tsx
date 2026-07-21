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
        <h1 className="text-xl font-bold text-white">管理者専用ページです</h1>
        <p className="mt-3 text-sm text-white/70">
          今のあなたの立場は{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono">
            role = {user.role}
          </code>{" "}
          です。講座を投稿できるのは{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono">
            admin
          </code>{" "}
          だけです。
        </p>
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          <p className="font-medium text-white">自分を管理者にするには（EP34）</p>
          <p className="mt-2">
            ローカルDBなら次のコマンドで変更できます：
          </p>
          <pre className="mt-2 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs text-white/90">
{`npm run make-admin -- ${user.email}`}
          </pre>
          <p className="mt-2 text-xs text-white/50">
            変更したら、いったんログアウト → 再ログインすると反映されます。
          </p>
        </div>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-white/50 hover:text-white/80">
            ← 講座トップへ
          </Link>
        </p>
      </main>
    );
  }

  const list = await db.select().from(courses).orderBy(desc(courses.createdAt));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">管理画面</h1>
          <p className="mt-1 text-sm text-white/50">
            {user.name}（{user.email}）／ role = {user.role}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="shrink-0 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          ＋ コース作成
        </Link>
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-white/50">
          講座一覧（{list.length}件）
        </h2>

        {list.length === 0 ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
            まだ講座がありません。「＋ コース作成」から1つ作ってみましょう。
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {list.map((course) => (
              <li
                key={course.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                {/* サムネイル（あれば）— 一覧でも識別しやすくする */}
                {course.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnailUrl}
                    alt=""
                    className="hidden h-12 w-20 shrink-0 rounded-md border border-white/10 object-cover sm:block"
                  />
                ) : (
                  <div className="hidden h-12 w-20 shrink-0 place-items-center rounded-md border border-white/10 bg-white/5 text-[10px] text-white/30 sm:grid">
                    No Image
                  </div>
                )}

                <Link
                  href={`/admin/courses/${course.id}`}
                  className="group min-w-0 flex-1"
                >
                  <p className="truncate font-medium text-white group-hover:text-indigo-300">
                    {course.title}
                  </p>
                  <p className="mt-1 truncate font-mono text-xs text-white/40">
                    /{course.slug}
                  </p>
                </Link>
                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:bg-white/5"
                  >
                    編集
                  </Link>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      course.published
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-white/10 text-white/50"
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
                      className="rounded-lg border border-white/15 px-3 py-1 text-xs text-white/80 transition hover:bg-white/5"
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
        <Link href="/" className="text-white/50 hover:text-white/80">
          ← 講座トップへ
        </Link>
      </p>
    </main>
  );
}
