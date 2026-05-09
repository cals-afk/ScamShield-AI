import { useState } from "react";
import { useAnalyseMessage } from "@workspace/api-client-react";
import { AlertCircle, CheckCircle, Shield, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import type { ScamAnalysis } from "@workspace/api-client-react/src/generated/api.schemas";
import { useTheme } from "@/context/ThemeContext";

export default function Home() {
  const [message, setMessage] = useState("");
  const analyseMessageMutation = useAnalyseMessage();
  const { theme, character } = useTheme();

  const primary = theme?.primaryColor ?? "#00d4ff";

  const handleAnalyse = () => {
    if (!message.trim()) return;
    analyseMessageMutation.mutate({ data: { message } });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 animate-in fade-in duration-700">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="z-10 w-full max-w-3xl flex flex-col gap-8">
        {theme && (
          <div
            className="text-center font-mono text-xs tracking-[0.4em] uppercase animate-in fade-in duration-1000"
            style={{ color: `${primary}88` }}
          >
            {theme.label} · ACTIVE
          </div>
        )}

        <header className="text-center space-y-4">
          <h1
            className="neon-title text-5xl md:text-6xl font-extrabold tracking-tight flex items-center justify-center gap-4"
            style={theme ? { color: primary, textShadow: `0 0 10px ${primary}, 0 0 30px ${primary}99, 0 0 60px ${primary}55` } : {}}
          >
            <Shield
              className="neon-shield w-12 h-12 md:w-14 md:h-14 shrink-0"
              style={theme ? { color: primary, filter: `drop-shadow(0 0 8px ${primary}) drop-shadow(0 0 20px ${primary}88)` } : {}}
            />
            ScamShield AI
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-mono uppercase tracking-widest">
            AI-powered scam and phishing detection assistant
          </p>
          {character && (
            <p className="font-mono text-sm" style={{ color: `${primary}99` }}>
              Calibrated for {character}
            </p>
          )}
        </header>

        <section className="flex flex-col gap-6">
          <div className="relative group">
            <div
              className="absolute -inset-0.5 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"
              style={{ background: `${primary}33` }}
            />
            <textarea
              data-testid="input-message"
              className="relative w-full h-48 md:h-64 bg-card border border-border rounded-xl p-4 md:p-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-all resize-none font-mono text-sm md:text-base shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
              style={{ "--tw-ring-color": primary } as React.CSSProperties}
              placeholder="PASTE SUSPICIOUS MESSAGE HERE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            data-testid="button-analyse"
            onClick={handleAnalyse}
            disabled={analyseMessageMutation.isPending || !message.trim()}
            className="group relative w-full flex justify-center py-4 px-4 border text-lg font-bold rounded-xl text-primary-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider overflow-hidden hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            style={{
              backgroundColor: primary,
              borderColor: `${primary}66`,
              color: theme?.backgroundColor ?? "#0a0e1a",
              boxShadow: `0 0 20px ${primary}55`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 45px ${primary}bb, 0 0 80px ${primary}44`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${primary}55`;
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center gap-2 transition-transform duration-300 group-hover:gap-3">
              {analyseMessageMutation.isPending ? (
                <>
                  <Zap className="animate-pulse" />
                  ANALYSING...
                </>
              ) : (
                <>
                  <ShieldCheck className="transition-transform duration-300 group-hover:rotate-12" />
                  ANALYSE THREAT
                </>
              )}
            </span>
          </button>
        </section>

        {analyseMessageMutation.isError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive flex items-start gap-3">
            <ShieldAlert className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Analysis Failed</h3>
              <p className="text-sm mt-1">{analyseMessageMutation.error?.message || "An unexpected error occurred during analysis."}</p>
            </div>
          </div>
        )}

        {analyseMessageMutation.isSuccess && analyseMessageMutation.data && (
          <ResultSection result={analyseMessageMutation.data} themePrimary={primary} />
        )}
      </div>
    </div>
  );
}

function ResultSection({ result, themePrimary }: { result: ScamAnalysis; themePrimary: string }) {
  const getRiskColor = (percentage: number) => {
    if (percentage <= 20) return "#34d399";
    if (percentage <= 50) return "#fbbf24";
    if (percentage <= 80) return "#f97316";
    return "#ef4444";
  };

  const getRiskBg = (percentage: number) => {
    const c = getRiskColor(percentage);
    return { borderColor: `${c}44`, backgroundColor: `${c}0d` };
  };

  const riskColor = getRiskColor(result.scamPercentage);

  return (
    <div
      className="mt-4 p-6 md:p-8 rounded-2xl border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col gap-8"
      style={getRiskBg(result.scamPercentage)}
      data-testid="section-result"
    >
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={riskColor}
                strokeWidth="8"
                strokeDasharray={`${result.scamPercentage * 2.51} 251.2`}
                className="transition-all duration-1000 ease-out"
                style={{ strokeLinecap: "round", filter: `drop-shadow(0 0 6px ${riskColor})` }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span
                className="text-5xl font-black"
                style={{ color: riskColor, textShadow: `0 0 12px ${riskColor}` }}
                data-testid="text-scam-percentage"
              >
                {result.scamPercentage}%
              </span>
              <span className="text-muted-foreground font-mono text-sm tracking-widest mt-1 uppercase">Risk Level</span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1 text-center md:text-left">
            <h2
              className="text-3xl font-bold uppercase tracking-wide"
              style={{ color: riskColor, textShadow: `0 0 10px ${riskColor}88` }}
              data-testid="text-verdict"
            >
              {result.verdict.replace(/_/g, " ")}
            </h2>
            <p className="text-foreground/80 leading-relaxed font-medium" data-testid="text-explanation">
              {result.explanation}
            </p>
          </div>

          {result.indicators.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                Analysis Indicators
              </h4>
              <ul className="space-y-2">
                {result.indicators.map((indicator, index) => {
                  let Icon = AlertCircle;
                  let color = "#e0f8ff";
                  let bg = "rgba(255,255,255,0.05)";
                  let border = "rgba(255,255,255,0.1)";

                  if (indicator.type === "red_flag") {
                    Icon = ShieldAlert;
                    color = "#f87171";
                    bg = "rgba(239,68,68,0.08)";
                    border = "rgba(239,68,68,0.2)";
                  } else if (indicator.type === "yellow_flag") {
                    Icon = AlertCircle;
                    color = "#fbbf24";
                    bg = "rgba(251,191,36,0.08)";
                    border = "rgba(251,191,36,0.2)";
                  } else {
                    Icon = CheckCircle;
                    color = "#34d399";
                    bg = "rgba(52,211,153,0.08)";
                    border = "rgba(52,211,153,0.2)";
                  }

                  return (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                      style={{ backgroundColor: bg, borderColor: border }}
                      data-testid={`item-indicator-${index}`}
                    >
                      <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color }} />
                      <span className="text-sm text-foreground/90">{indicator.description}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
