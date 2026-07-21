import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { isGoogleLoginEnabled } from "@/lib/auth";

export const metadata = {
  title: "ログイン | 動画講座",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-57px)] max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">ログイン</h1>
          <p className="mt-2 text-sm text-white/60">
            受講状況を保存するために本人確認をします
          </p>
        </div>

        <LoginForm googleEnabled={isGoogleLoginEnabled} />
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/" className="text-white/50 transition hover:text-white/80">
          ← 講座トップへ戻る
        </Link>
      </p>
    </main>
  );
}
