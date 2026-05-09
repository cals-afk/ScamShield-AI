import { useState } from "react";
import { useAnalyseMessage } from "@workspace/api-client-react";
import { AlertCircle, CheckCircle, ShieldAlert, ShieldCheck, Zap } from "lucide-react";
import type { ScamAnalysis } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Home() {
  const [message, setMessage] = useState("");
  const analyseMessageMutation = useAnalyseMessage();

  const handleAnalyse = () => {
    if (!message.trim()) return;
    analyseMessageMutation.mutate({ data: { message } });
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6">
      {/* Scanline / Grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      <div className="z-10 w-full max-w-3xl flex flex-col gap-8">
        <header className="text-center space-y-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-primary drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">
            ScamShield AI
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-mono uppercase tracking-widest">
            AI-powered scam and phishing detection assistant
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-primary/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <textarea
              data-testid="input-message"
              className="relative w-full h-48 md:h-64 bg-card border border-border rounded-xl p-4 md:p-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-mono text-sm md:text-base shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
              placeholder="PASTE SUSPICIOUS MESSAGE HERE..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            data-testid="button-analyse"
            onClick={handleAnalyse}
            disabled={analyseMessageMutation.isPending || !message.trim()}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider overflow-hidden shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)]"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
            <span className="relative flex items-center gap-2">
              {analyseMessageMutation.isPending ? (
                <>
                  <Zap className="animate-pulse" />
                  ANALYSING...
                </>
              ) : (
                <>
                  <ShieldCheck />
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
          <ResultSection result={analyseMessageMutation.data} />
        )}
      </div>
    </div>
  );
}

function ResultSection({ result }: { result: ScamAnalysis }) {
  const getRiskColor = (percentage: number) => {
    if (percentage <= 20) return "text-emerald-400";
    if (percentage <= 50) return "text-amber-400";
    if (percentage <= 80) return "text-orange-500";
    return "text-red-500";
  };

  const getRiskBg = (percentage: number) => {
    if (percentage <= 20) return "bg-emerald-400/10 border-emerald-400/30";
    if (percentage <= 50) return "bg-amber-400/10 border-amber-400/30";
    if (percentage <= 80) return "bg-orange-500/10 border-orange-500/30";
    return "bg-red-500/10 border-red-500/30";
  };

  const getRiskGlow = (percentage: number) => {
    if (percentage <= 20) return "drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]";
    if (percentage <= 50) return "drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]";
    if (percentage <= 80) return "drop-shadow-[0_0_10px_rgba(249,115,22,0.8)]";
    return "drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]";
  };

  const riskColor = getRiskColor(result.scamPercentage);
  const riskBg = getRiskBg(result.scamPercentage);
  const riskGlow = getRiskGlow(result.scamPercentage);

  return (
    <div className={`mt-4 p-6 md:p-8 rounded-2xl border ${riskBg} backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out flex flex-col gap-8`} data-testid="section-result">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Circular Gauge Background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-foreground/10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray={`${result.scamPercentage * 2.51} 251.2`}
                className={`${riskColor} transition-all duration-1000 ease-out`}
                style={{ strokeLinecap: "round" }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className={`text-5xl font-black ${riskColor} ${riskGlow}`} data-testid="text-scam-percentage">
                {result.scamPercentage}%
              </span>
              <span className="text-muted-foreground font-mono text-sm tracking-widest mt-1 uppercase">
                Risk Level
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1 text-center md:text-left">
            <h2 className={`text-3xl font-bold uppercase tracking-wide ${riskColor} ${riskGlow}`} data-testid="text-verdict">
              {result.verdict.replace("_", " ")}
            </h2>
            <p className="text-foreground/80 leading-relaxed font-medium" data-testid="text-explanation">
              {result.explanation}
            </p>
          </div>

          {result.indicators.length > 0 && (
            <div className="space-y-3 mt-6">
              <h4 className="text-sm font-mono text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Analysis Indicators</h4>
              <ul className="space-y-2">
                {result.indicators.map((indicator, index) => {
                  let Icon = AlertCircle;
                  let colorClass = "text-foreground";
                  let bgClass = "bg-secondary";
                  
                  if (indicator.type === "red_flag") {
                    Icon = ShieldAlert;
                    colorClass = "text-red-400";
                    bgClass = "bg-red-500/10 border-red-500/20";
                  } else if (indicator.type === "yellow_flag") {
                    Icon = AlertCircle;
                    colorClass = "text-amber-400";
                    bgClass = "bg-amber-400/10 border-amber-400/20";
                  } else {
                    Icon = CheckCircle;
                    colorClass = "text-emerald-400";
                    bgClass = "bg-emerald-500/10 border-emerald-500/20";
                  }

                  return (
                    <li key={index} className={`flex items-start gap-3 p-3 rounded-lg border ${bgClass}`} data-testid={`item-indicator-${index}`}>
                      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${colorClass}`} />
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
