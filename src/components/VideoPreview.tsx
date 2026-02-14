import { extractYouTubeVideoId } from "@/lib/trio-api";

interface VideoPreviewProps {
  url: string;
}

const VideoPreview = ({ url }: VideoPreviewProps) => {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video rounded-lg bg-secondary flex items-center justify-center border border-border">
        <p className="text-muted-foreground text-sm">无效的 YouTube 链接</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden border border-border relative">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="YouTube Live Stream"
      />
      <div className="absolute top-3 left-3 flex items-center gap-2 glass px-3 py-1.5 rounded-full">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        <span className="text-xs font-medium text-foreground">LIVE</span>
      </div>
    </div>
  );
};

export default VideoPreview;
