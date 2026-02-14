import { CheckCircle2, XCircle, Clock, Zap } from "lucide-react";

export interface CheckResult {
  id: string;
  condition: string;
  triggered: boolean;
  explanation: string;
  latency_ms: number;
  timestamp: Date;
}

interface ResultCardProps {
  result: CheckResult;
  index: number;
}

const ResultCard = ({ result, index }: ResultCardProps) => {
  return (
    <div
      className="glass-card rounded-lg p-4 animate-fade-in-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-0.5 p-1.5 rounded-full ${result.triggered ? "bg-success/20" : "bg-muted"}`}>
            {result.triggered ? (
              <CheckCircle2 className="w-4 h-4 text-success" />
            ) : (
              <XCircle className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">{result.condition}</p>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
        <div className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold ${result.triggered ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
          {result.triggered ? "是 ✓" : "否 ✗"}
        </div>
      </div>
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {result.timestamp.toLocaleTimeString("zh-CN")}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Zap className="w-3 h-3" />
          {result.latency_ms}ms
        </div>
      </div>
    </div>
  );
};

export default ResultCard;
