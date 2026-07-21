import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessAdmin } from "@/lib/admin";
import { isBlobEnabled } from "@/lib/blob";
import { getCurrentUser } from "@/lib/session";
import { NewCourseForm } from "./NewCourseForm";

export const metadata = { title: "コース作成 | 管理画面" };

export default async function NewCoursePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canAccessAdmin(user)) redirect("/admin");

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-bold text-white">コース作成</h1>
      <p className="mt-2 text-sm text-white/60">
        コース → セクション → レッスン の3階層。まずはコースを1つ作ります。
      </p>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <NewCourseForm blobEnabled={isBlobEnabled} />
      </div>

      <p className="mt-8 text-sm">
        <Link href="/admin" className="text-white/50 hover:text-white/80">
          ← 管理画面へ戻る
        </Link>
      </p>
    </main>
  );
}
