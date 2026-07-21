"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "login" | "signup";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result =
      mode === "signup"
        ? await signUp.email({ name, email, password })
        : await signIn.email({ email, password });

    setLoading(false);

    if (result.error) {
      setError(result.error.message ?? "うまくいきませんでした");
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    // Googleの画面へ飛び、確認後 /api/auth/callback/google に戻ってくる
    await signIn.social({ provider: "google", callbackURL: "/" });
  }

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="flex rounded-lg border border-gray-200 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 ${
            mode === "login" ? "bg-gray-900 text-white" : "text-gray-600"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 ${
            mode === "signup" ? "bg-gray-900 text-white" : "text-gray-600"
          }`}
        >
          新規登録
        </button>
      </div>

      {googleEnabled ? (
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium hover:bg-gray-50"
        >
          Googleで続行
        </button>
      ) : (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          Googleログインは未設定です。GCPで発行した
          <code className="mx-1">GOOGLE_CLIENT_ID</code>と
          <code className="mx-1">GOOGLE_CLIENT_SECRET</code>を
          <code className="mx-1">.env.local</code>
          に入れて再起動すると、ここに「Googleで続行」ボタンが出ます。
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        またはメールで
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            required
            placeholder="お名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
        )}
        <input
          type="email"
          required
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="パスワード（8文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gray-900 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading
            ? "処理中…"
            : mode === "signup"
              ? "登録する"
              : "ログインする"}
        </button>
      </form>
    </div>
  );
}
