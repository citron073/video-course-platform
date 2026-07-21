/**
 * 受講エリアのレイアウト。
 * サイドバー（講座構造）は「どのレッスンか」に依存するため、
 * レイアウトではなく各レッスンページ側で描画する
 * （App Router のレイアウトは子の [lessonId] param を受け取れないため）。
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
