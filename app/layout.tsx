import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "動画講座",
  description: "YouTube限定公開動画を使った動画講座プラットフォーム",
  robots: { index: false, follow: false }, // 限定公開のため検索インデックスを抑止
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
