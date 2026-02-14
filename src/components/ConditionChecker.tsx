import { useState } from "react";
import {
  CloudRain, Sun, CloudSnow, Wind, CloudLightning,
  Cloud, Eye, Send, Loader2,
} from "lucide-react";

interface ConditionCheckerProps {
  onCheck: (condition: string) => void;
  isLoading?: boolean;
}

const presets = [
  { icon: CloudRain, label: "下雨", condition: "Is it raining?" },
  { icon: CloudSnow, label: "下雪", condition: "Is it snowing?" },
  { icon: Sun, label: "晴天", condition: "Is it sunny or clear sky?" },
  { icon: Cloud, label: "多云", condition: "Is it cloudy or overcast?" },
  { icon: Wind, label: "大风", condition: "Are there signs of strong wind?" },
  { icon: CloudLightning, label: "雷暴", condition: "Is there a thunderstorm or lightning visible?" },
  { icon: Eye, label: "能见度低", condition: "Is the visibility low due to fog or haze?" },
];

const ConditionChecker = ({ onCheck, isLoading }: ConditionCheckerProps) => {
  const [custom, setCustom] = useState("");

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (custom.trim()) {
      onCheck(custom.trim());
      setCustom("");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground">快速检测</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onCheck(preset.condition)}
            disabled={isLoading}
            className="glass-card rounded-lg px-3 py-3 flex flex-col items-center gap-2 hover:border-primary/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <preset.icon className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-foreground">{preset.label}</span>
          </button>
        ))}
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">自定义检测</h3>
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="输入是非题，例如：Is there a rainbow?"
            className="flex-1 px-4 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !custom.trim()}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ConditionChecker;
