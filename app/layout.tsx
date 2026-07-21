import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://video-course-platform-theta.vercel.app"),
  title: "動画講座プラットフォーム",
  description: "YouTube動画で学べる、セクション別の動画講座プラットフォーム。",
  robots: { index: false, follow: false }, // 練習/限定公開のため検索インデックスを抑止
  // OGP: URLを共有したときにタイトル・説明のカードが出るようにする（EP35-36 公開の仕上げ）
  openGraph: {
    title: "動画講座プラットフォーム",
    description: "YouTube動画で学べる、セクション別の動画講座プラットフォーム。",
    type: "website",
    locale: "ja_JP",
    siteName: "動画講座プラットフォーム",
  },
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
