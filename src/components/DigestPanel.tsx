import { useState, useRef } from "react";
import { BookOpen, Play, Square, Loader2 } from "lucide-react";
import { liveDigest } from "@/lib/trio-api";

interface DigestPanelProps {
  streamUrl: string;
}

const DigestPanel = ({ streamUrl }: DigestPanelProps) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const start = async () => {
    setIsRunning(true);
    setError(null);
    setMessages([]);

    const controller = await liveDigest(
      streamUrl,
      (msg) => setMessages((prev) => [...prev, msg]),
      (err) => {
        setError(err);
        setIsRunning(false);
      }
    );
    controllerRef.current = controller;
  };

  const stop = () => {
    controllerRef.current?.abort();
    setIsRunning(false);
  };

  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-semibold text-foreground">实时摘要</h3>
          {isRunning && (
            <span className="flex items-center gap-1 text-xs text-accent">
              <Loader2 className="w-3 h-3 animate-spin" />
              流式传输中...
            </span>
          )}
        </div>
        <button
          onClick={isRunning ? stop : start}
          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
            isRunning
              ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
              : "bg-accent/20 text-accent hover:bg-accent/30"
          }`}
        >
          {isRunning ? (
            <>
              <Square className="w-3 h-3" /> 停止
            </>
          ) : (
            <>
              <Play className="w-3 h-3" /> 开始
            </>
          )}
        </button>
      </div>
      <div className="p-4 max-h-64 overflow-y-auto space-y-2 font-mono text-xs">
        {messages.length === 0 && !error && (
          <p className="text-muted-foreground text-center py-6">
            点击"开始"获取直播流的 AI 实时摘要
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className="animate-fade-in-up text-secondary-foreground leading-relaxed">
            {msg}
          </div>
        ))}
        {error && (
          <p className="text-destructive text-center py-2">{error}</p>
        )}
      </div>
    </div>
  );
};

export default DigestPanel;
