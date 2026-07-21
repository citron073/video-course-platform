"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "login" | "signup";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-white/40 transition focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400";

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
    <div className="w-full space-y-6">
      <div className="flex rounded-lg border border-white/10 bg-white/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-2 transition ${
            mode === "login"
              ? "bg-indigo-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          ログイン
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-2 transition ${
            mode === "signup"
              ? "bg-indigo-500 text-white"
              : "text-white/60 hover:text-white"
          }`}
        >
          新規登録
        </button>
      </div>

      {googleEnabled ? (
        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
        >
          <svg className="h-4 w-4" viewBox="0 0 48 48" aria-hidden="true">
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            />
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            />
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            />
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            />
          </svg>
          Googleで続行
        </button>
      ) : (
        <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs text-amber-200">
          Googleログインは未設定です。GCPで発行した
          <code className="mx-1">GOOGLE_CLIENT_ID</code>と
          <code className="mx-1">GOOGLE_CLIENT_SECRET</code>を設定すると、
          ここに「Googleで続行」ボタンが出ます。
        </p>
      )}

      <div className="flex items-center gap-3 text-xs text-white/40">
        <div className="h-px flex-1 bg-white/10" />
        またはメールで
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === "signup" && (
          <input
            type="text"
            required
            placeholder="お名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        )}
        <input
          type="email"
          required
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="パスワード（8文字以上）"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        {error && (
          <p className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-500 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-50"
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
