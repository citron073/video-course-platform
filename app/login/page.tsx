import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import { isGoogleLoginEnabled } from "@/lib/auth";

export const metadata = {
  title: "ログイン | 動画講座",
};

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold">ログイン</h1>
        <p className="mt-2 text-sm text-gray-500">
          受講状況を保存するために本人確認をします
        </p>
      </div>

      <LoginForm googleEnabled={isGoogleLoginEnabled} />

      <p className="mt-8 text-center text-sm">
        <Link href="/" className="text-gray-500 hover:underline">
          ← 講座トップへ戻る
        </Link>
      </p>
    </main>
  );
}
