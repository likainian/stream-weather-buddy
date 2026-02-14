import { useState, useCallback } from "react";
import { CloudRain, Activity, BarChart3 } from "lucide-react";
import StreamInput from "@/components/StreamInput";
import VideoPreview from "@/components/VideoPreview";
import ConditionChecker from "@/components/ConditionChecker";
import ResultCard, { type CheckResult } from "@/components/ResultCard";
import DigestPanel from "@/components/DigestPanel";
import { checkOnce } from "@/lib/trio-api";
import { toast } from "sonner";

const Index = () => {
  const [streamUrl, setStreamUrl] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<CheckResult[]>([]);

  const handleStreamSubmit = (url: string) => {
    setStreamUrl(url);
    setResults([]);
  };

  const handleCheck = useCallback(
    async (condition: string) => {
      if (!streamUrl) {
        toast.error("请先输入直播链接");
        return;
      }
      setIsChecking(true);
      try {
        const result = await checkOnce(streamUrl, condition);
        const newResult: CheckResult = {
          id: crypto.randomUUID(),
          condition,
          triggered: result.triggered,
          explanation: result.explanation,
          latency_ms: result.latency_ms,
          timestamp: new Date(),
        };
        setResults((prev) => [newResult, ...prev]);
        toast.success(result.triggered ? "条件匹配！" : "条件未匹配");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "检测失败";
        toast.error(msg);
      } finally {
        setIsChecking(false);
      }
    },
    [streamUrl]
  );

  const triggeredCount = results.filter((r) => r.triggered).length;

  return (
    <div className="min-h-screen bg-gradient-hero rain-overlay">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 glow-primary">
              <CloudRain className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">
                Weather<span className="text-gradient">Eye</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                AI 实时天气流监控
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="glass px-3 py-1.5 rounded-full flex items-center gap-1.5">
              Powered by <span className="text-primary font-semibold">Trio API</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Stream Input */}
        <section>
          <StreamInput onSubmit={handleStreamSubmit} />
        </section>

        {streamUrl && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 animate-fade-in-up">
            {/* Left: Video + Conditions */}
            <div className="lg:col-span-3 space-y-6">
              <VideoPreview url={streamUrl} />
              <ConditionChecker onCheck={handleCheck} isLoading={isChecking} />
              <DigestPanel streamUrl={streamUrl} />
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass-card rounded-lg p-4 text-center">
                  <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
                  <p className="text-2xl font-bold text-foreground">{results.length}</p>
                  <p className="text-xs text-muted-foreground">总检测次数</p>
                </div>
                <div className="glass-card rounded-lg p-4 text-center">
                  <BarChart3 className="w-4 h-4 text-success mx-auto mb-1" />
                  <p className="text-2xl font-bold text-success">{triggeredCount}</p>
                  <p className="text-xs text-muted-foreground">匹配次数</p>
                </div>
              </div>

              {/* Result list */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground">检测结果</h3>
                {results.length === 0 ? (
                  <div className="glass-card rounded-lg p-8 text-center">
                    <CloudRain className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      点击左侧天气按钮开始检测
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {results.map((result, index) => (
                      <ResultCard key={result.id} result={result} index={index} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!streamUrl && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="inline-flex p-4 rounded-2xl bg-primary/5 mb-6">
              <CloudRain className="w-16 h-16 text-primary opacity-60" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              输入 YouTube 直播链接开始监控
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              WeatherEye 使用 AI 视觉模型实时分析直播画面中的天气状况。
              支持检测下雨、下雪、晴天、大风等多种天气条件。
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <span className="glass px-3 py-1.5 rounded-full">🌧️ 下雨检测</span>
              <span className="glass px-3 py-1.5 rounded-full">❄️ 降雪检测</span>
              <span className="glass px-3 py-1.5 rounded-full">☀️ 晴天识别</span>
              <span className="glass px-3 py-1.5 rounded-full">🌩️ 雷暴预警</span>
              <span className="glass px-3 py-1.5 rounded-full">🌫️ 能见度分析</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>WeatherEye — Hackathon 2026</span>
          <span>Built with Trio API + AI Vision</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;
