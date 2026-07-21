/**
 * YouTube 埋め込み（プライバシー強化モード = youtube-nocookie.com）。
 * 16:9 のレスポンシブ枠。公開/限定公開(unlisted)動画のみ埋め込み可能。
 */
export default function YouTubeEmbed({
  youtubeId,
  title,
}: {
  youtubeId: string;
  title: string;
}) {
  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`;

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-lg aspect-video">
      <iframe
        className="absolute inset-0 h-full w-full"
        src={src}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
