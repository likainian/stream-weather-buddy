import { useState } from "react";
import { Radio, ExternalLink } from "lucide-react";

interface StreamInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const StreamInput = ({ onSubmit, isLoading }: StreamInputProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="block text-sm font-medium text-muted-foreground mb-2">
        YouTube 直播链接
      </label>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Radio className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-pulse-glow" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full pl-11 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-mono text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all glow-primary"
        >
          <ExternalLink className="w-4 h-4 inline mr-2" />
          加载
        </button>
      </div>
    </form>
  );
};

export default StreamInput;
