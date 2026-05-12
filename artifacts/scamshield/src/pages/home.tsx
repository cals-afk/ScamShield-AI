import { useEffect, useState } from "react";
import { useAnalyseMessage } from "@workspace/api-client-react";
import { AlertCircle, AlertTriangle, CheckCircle, CreditCard, ExternalLink, Gift, KeyRound, MessageSquare, Phone, Shield, ShieldAlert, ShieldCheck, Timer, UserX, Zap } from "lucide-react";
import type { ScamAnalysis } from "@workspace/api-client-react";
import { useTheme } from "@/context/ThemeContext";

type InputMode = "message" | "phone_number";

const SCAN_STEPS: { label: string; tag: string }[] = [
  { label: "Initialising threat analysis engine",  tag: "BOOT"     },
  { label: "Tokenising message structure",          tag: "PARSE"    },
  { label: "Scanning phishing indicators",          tag: "PHISH"    },
  { label: "Detecting urgency manipulation",        tag: "SOCIAL"   },
  { label: "Cross-checking sender identity",        tag: "IDENTITY" },
  { label: "Analyzing behavioral patterns",         tag: "BEHAV"    },
  { label: "Inspecting embedded URLs & domains",    tag: "NET"      },
  { label: "Evaluating linguistic deception cues",  tag: "NLP"      },
  { label: "Evaluating scam probability score",     tag: "SCORE"    },
  { label: "Compiling threat report",               tag: "REPORT"   },
];

// Pseudo-random hex ticker seed
function fakeHex(seed: number, len: number) {
  let s = "";
  for (let i = 0; i < len; i++) {
    s += ((seed * 1103515245 + 12345 + i * 137) & 0xff).toString(16).padStart(2, "0").toUpperCase() + " ";
  }
  return s.trim();
}

function ScanningAnimation({ primary }: { primary: string }) {
  const [step, setStep] = useState(0);          // which step is active
  const [exiting, setExiting] = useState(false); // slide-out the active label
  const [tick, setTick] = useState(0);          // drives hex ticker rerender
  const [hexSeed, setHexSeed] = useState(42);

  // Advance through steps
  useEffect(() => {
    const id = setInterval(() => {
      setExiting(true);
      setTimeout(() => {
        setStep((s) => Math.min(s + 1, SCAN_STEPS.length - 1));
        setExiting(false);
      }, 280);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  // Hex ticker — fast churn
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      setHexSeed((s) => (s * 1103515245 + 12345) & 0x7fffffff);
    }, 120);
    return () => clearInterval(id);
  }, []);

  void tick; // suppress unused warning

  const progress = Math.round(((step + 1) / SCAN_STEPS.length) * 100);
  const completed = SCAN_STEPS.slice(0, step);
  const active    = SCAN_STEPS[step];

  return (
    <div
      className="relative overflow-hidden rounded-xl border animate-rise-in font-mono"
      style={{ borderColor: `${primary}40`, backgroundColor: `${primary}05` }}
      data-testid="scanning-animation"
    >
      {/* Sweeping scan line */}
      <div
        className="absolute inset-x-0 h-px animate-scan-sweep pointer-events-none z-10"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${primary} 40%, ${primary} 60%, transparent 100%)`,
          boxShadow: `0 0 12px 3px ${primary}66`,
        }}
      />

      {/* ── Header bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-2.5 border-b"
        style={{ borderColor: `${primary}25`, backgroundColor: `${primary}08` }}
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: primary, animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <span className="text-xs uppercase tracking-[0.3em]" style={{ color: `${primary}99` }}>
          Sentinel Threat Analysis
        </span>
        <span className="ml-auto text-xs" style={{ color: `${primary}55` }}>
          PID:&nbsp;
          <span style={{ color: `${primary}99` }}>
            {(0x2A00 + step * 17).toString(16).toUpperCase()}
          </span>
        </span>
        <span className="text-xs animate-terminal-blink" style={{ color: `${primary}77` }}>█</span>
      </div>

      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">

        {/* ── Completed steps log ── */}
        <div className="flex flex-col gap-1 min-h-[2.4rem]">
          {completed.slice(-3).map((s, i) => (
            <div
              key={s.tag}
              className="flex items-center gap-2 text-xs"
              style={{
                color: `${primary}${i === completed.slice(-3).length - 1 ? "55" : "33"}`,
                transition: "opacity 0.4s ease",
              }}
            >
              <span style={{ color: `${primary}55` }}>✓</span>
              <span className="uppercase tracking-widest text-[10px]" style={{ color: `${primary}44`, minWidth: "3.8rem" }}>
                [{s.tag}]
              </span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Active step — slides up on change ── */}
        <div className="overflow-hidden" style={{ height: "1.4rem" }}>
          {active && (
            <div
              className="flex items-center gap-2 text-sm"
              style={{
                color: primary,
                textShadow: `0 0 14px ${primary}88`,
                opacity: exiting ? 0 : 1,
                transform: exiting ? "translateY(-8px)" : "translateY(0)",
                transition: "opacity 0.25s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <span className="animate-terminal-blink" style={{ color: `${primary}cc` }}>▶</span>
              <span
                className="uppercase tracking-widest text-[10px]"
                style={{ color: `${primary}99`, minWidth: "3.8rem" }}
              >
                [{active.tag}]
              </span>
              <span>{active.label}…</span>
              <span
                className="ml-auto text-xs tabular-nums"
                style={{ color: `${primary}66` }}
              >
                {(step + 1).toString().padStart(2, "0")}&nbsp;/&nbsp;{SCAN_STEPS.length.toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* ── Hex data stream ticker ── */}
        <div
          className="rounded px-2 py-1 text-[10px] tracking-widest overflow-hidden whitespace-nowrap select-none"
          style={{ backgroundColor: `${primary}08`, color: `${primary}40`, borderLeft: `2px solid ${primary}30` }}
        >
          {fakeHex(hexSeed, 22)}
        </div>

        {/* ── Progress bar ── */}
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: `${primary}18` }}
          >
            <div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`,
                backgroundColor: primary,
                boxShadow: `0 0 8px ${primary}`,
                transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                className="absolute inset-0 animate-shimmer-h"
                style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)` }}
              />
            </div>
          </div>
          <span className="text-[11px] tabular-nums" style={{ color: `${primary}77` }}>
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("message");
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const analyseMessageMutation = useAnalyseMessage();
  const { theme, character } = useTheme();

  const primary = theme?.primaryColor ?? "#00d4ff";
  const activeInput = inputMode === "message" ? message : phoneNumber;

  const handleAnalyse = () => {
    if (!activeInput.trim()) return;
    analyseMessageMutation.mutate({
      data: { message: activeInput.trim(), inputType: inputMode },
    });
  };

  const handleModeSwitch = (mode: InputMode) => {
    setInputMode(mode);
    analyseMessageMutation.reset();
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background text-foreground relative overflow-hidden flex flex-col items-center py-12 px-4 sm:px-6 animate-page-enter">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="z-10 w-full max-w-3xl flex flex-col gap-8">
        {theme && (
          <div
            className="text-center font-mono text-xs tracking-[0.4em] uppercase animate-slide-left-in delay-50"
            style={{ color: `${primary}88` }}
          >
            {theme.label} · ACTIVE
          </div>
        )}

        {/* Header */}
        <header className="text-center space-y-4 animate-rise-in delay-100">
          <h1
            className="neon-title text-5xl md:text-6xl font-extrabold tracking-tight flex items-center justify-center gap-4"
            style={theme ? { color: primary, textShadow: `0 0 10px ${primary}, 0 0 30px ${primary}99, 0 0 60px ${primary}55` } : {}}
          >
            <Shield
              className="neon-shield w-12 h-12 md:w-14 md:h-14 shrink-0"
              style={theme ? { color: primary, filter: `drop-shadow(0 0 8px ${primary}) drop-shadow(0 0 20px ${primary}88)` } : {}}
            />
            Sentinel AI
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

        <section className="flex flex-col gap-5">
          {/* Mode tabs */}
          <div
            className="flex rounded-xl border p-1 gap-1 animate-rise-in delay-200"
            style={{ borderColor: `${primary}30`, backgroundColor: `${primary}08` }}
          >
            {(["message", "phone_number"] as InputMode[]).map((mode) => {
              const isActive = inputMode === mode;
              const Icon = mode === "message" ? MessageSquare : Phone;
              const label = mode === "message" ? "Message / SMS" : "Phone Number";
              return (
                <button
                  key={mode}
                  data-testid={`tab-${mode}`}
                  onClick={() => handleModeSwitch(mode)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-sm font-bold uppercase tracking-wider transition-all duration-400"
                  style={
                    isActive
                      ? {
                          backgroundColor: primary,
                          color: theme?.backgroundColor ?? "#0a0e1a",
                          boxShadow: `0 0 16px ${primary}66`,
                        }
                      : {
                          color: `${primary}88`,
                        }
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Input area */}
          <div className="relative group animate-rise-in delay-300">
            <div
              className="absolute -inset-0.5 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-all duration-600"
              style={{ background: `${primary}33` }}
            />
            {inputMode === "message" ? (
              <div className="relative">
                <textarea
                  data-testid="input-message"
                  className="relative w-full h-48 md:h-56 bg-card border border-border rounded-xl p-4 md:p-6 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-400 resize-none font-mono text-sm md:text-base shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
                  style={{ "--tw-ring-color": primary } as React.CSSProperties}
                  placeholder="PASTE SUSPICIOUS MESSAGE HERE..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {analyseMessageMutation.isPending && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div
                      className="absolute inset-x-0 h-0.5 animate-scan-sweep"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${primary}cc 35%, ${primary} 50%, ${primary}cc 65%, transparent 100%)`,
                        boxShadow: `0 0 14px 3px ${primary}66`,
                      }}
                    />
                    <div
                      className="absolute inset-0 rounded-xl transition-all duration-400"
                      style={{ border: `1px solid ${primary}55`, boxShadow: `inset 0 0 30px ${primary}0d` }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <div
                  className="relative w-full bg-card border border-border rounded-xl px-5 py-5 flex items-center gap-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] focus-within:ring-2 focus-within:border-transparent transition-all duration-400"
                  style={{ "--tw-ring-color": primary } as React.CSSProperties}
                >
                  <Phone className="w-5 h-5 shrink-0 transition-colors duration-300" style={{ color: `${primary}88` }} />
                  <input
                    data-testid="input-phone"
                    type="tel"
                    className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none font-mono text-base md:text-lg tracking-widest"
                    placeholder="+1 800 555 0199"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyse()}
                  />
                </div>
                {analyseMessageMutation.isPending && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                    <div
                      className="absolute inset-x-0 h-0.5 animate-scan-sweep"
                      style={{
                        background: `linear-gradient(90deg, transparent 0%, ${primary}cc 35%, ${primary} 50%, ${primary}cc 65%, transparent 100%)`,
                        boxShadow: `0 0 14px 3px ${primary}66`,
                      }}
                    />
                    <div className="absolute inset-0 rounded-xl" style={{ border: `1px solid ${primary}55` }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Analyse button */}
          <button
            data-testid="button-analyse"
            onClick={handleAnalyse}
            disabled={analyseMessageMutation.isPending || !activeInput.trim()}
            className="group relative w-full flex justify-center py-4 px-4 border text-lg font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider overflow-hidden hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 animate-rise-in delay-400"
            style={{
              backgroundColor: primary,
              borderColor: `${primary}66`,
              color: theme?.backgroundColor ?? "#0a0e1a",
              boxShadow: `0 0 20px ${primary}55`,
              transition: "box-shadow 0.4s ease, transform 0.2s ease, opacity 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 50px ${primary}bb, 0 0 80px ${primary}44`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 20px ${primary}55`;
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative flex items-center gap-2 transition-all duration-300 group-hover:gap-3">
              {analyseMessageMutation.isPending ? (
                <>
                  <Zap className="animate-pulse" />
                  ANALYSING...
                </>
              ) : (
                <>
                  <ShieldCheck className="transition-transform duration-300 group-hover:rotate-12" />
                  {inputMode === "message" ? "ANALYSE THREAT" : "CHECK NUMBER"}
                </>
              )}
            </span>
          </button>
        </section>

        {analyseMessageMutation.isPending && (
          <ScanningAnimation primary={primary} />
        )}

        {analyseMessageMutation.isError && (
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/50 text-destructive flex items-start gap-3 animate-rise-in">
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

/* ─────────────────────────────────────────────
   SAFE RESULT  (scamPercentage ≤ 20)
───────────────────────────────────────────── */
const SAFE_GREEN = "#34d399";

function SafeResult({ result }: { result: ScamAnalysis }) {
  const safeSignals = result.indicators.filter((i) => i.type === "safe_signal");

  return (
    <div
      className="mt-4 rounded-2xl overflow-hidden flex flex-col animate-result-card-in"
      style={{
        border: `1px solid ${SAFE_GREEN}33`,
        backgroundColor: `${SAFE_GREEN}06`,
      }}
      data-testid="section-result"
    >
      {/* ── Status sweep banner ── */}
      <div
        className="relative overflow-hidden flex items-center justify-center gap-3 py-2.5 px-4"
        style={{ backgroundColor: `${SAFE_GREEN}14`, borderBottom: `1px solid ${SAFE_GREEN}28` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${SAFE_GREEN}33 40%, ${SAFE_GREEN}55 50%, ${SAFE_GREEN}33 60%, transparent 100%)`,
            animation: "safe-banner-sweep 2.2s ease-in-out 0.1s both",
          }}
        />
        <CheckCircle className="w-3.5 h-3.5 shrink-0 animate-safe-check-pop" style={{ color: SAFE_GREEN }} />
        <span
          className="font-mono text-xs uppercase tracking-[0.3em] font-bold"
          style={{ color: SAFE_GREEN, textShadow: `0 0 10px ${SAFE_GREEN}88` }}
        >
          Message Verified Safe
        </span>
        <span
          className="ml-auto font-mono text-[10px] tabular-nums"
          style={{ color: `${SAFE_GREEN}66` }}
        >
          CONFIDENCE: HIGH
        </span>
      </div>

      {/* ── Hero zone: radar rings + animated shield ── */}
      <div className="flex flex-col items-center pt-10 pb-6 gap-5 relative">
        {/* Ambient background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 55% at 50% 40%, ${SAFE_GREEN}0d 0%, transparent 70%)`,
          }}
        />

        {/* Concentric radar rings */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-52 h-52 pointer-events-none flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border animate-ring-expand"
              style={{
                width: "80px",
                height: "80px",
                borderColor: `${SAFE_GREEN}55`,
                animationDelay: `${i * 0.6}s`,
                animationDuration: "1.8s",
              }}
            />
          ))}
        </div>

        {/* Animated shield with check */}
        <div className="relative z-10 animate-safe-glow">
          <svg viewBox="0 0 96 96" className="w-24 h-24" fill="none">
            {/* Shield body */}
            <path
              d="M48 8 L82 22 L82 50 C82 70 64 84 48 88 C32 84 14 70 14 50 L14 22 Z"
              fill={`${SAFE_GREEN}18`}
              stroke={SAFE_GREEN}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Checkmark — draws itself */}
            <polyline
              points="30,50 42,62 66,36"
              stroke={SAFE_GREEN}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className="animate-check-draw"
              style={{ filter: `drop-shadow(0 0 6px ${SAFE_GREEN})` }}
            />
          </svg>
        </div>

        {/* Verdict + score */}
        <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
          <h2
            className="text-3xl md:text-4xl font-black uppercase tracking-widest"
            style={{
              color: SAFE_GREEN,
              textShadow: `0 0 16px ${SAFE_GREEN}99, 0 0 40px ${SAFE_GREEN}44`,
            }}
            data-testid="text-verdict"
          >
            {result.verdict.replace(/_/g, " ")}
          </h2>
          <p
            className="font-mono text-sm"
            style={{ color: `${SAFE_GREEN}99` }}
            data-testid="text-explanation"
          >
            {result.explanation}
          </p>
        </div>

        {/* ── Stat strip ── */}
        <div className="relative z-10 flex items-stretch gap-3 px-6 w-full max-w-sm mt-2">
          {[
            { label: "Risk Score",    value: `${result.scamPercentage}%`, delay: "0ms" },
            { label: "Threats Found", value: "0",                          delay: "80ms" },
            { label: "Confidence",    value: "HIGH",                       delay: "160ms" },
          ].map(({ label, value, delay }) => (
            <div
              key={label}
              className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3 px-2 animate-safe-counter-rise"
              style={{
                border: `1px solid ${SAFE_GREEN}28`,
                backgroundColor: `${SAFE_GREEN}0a`,
                animationDelay: delay,
              }}
            >
              <span
                className="text-xl font-black tabular-nums"
                style={{ color: SAFE_GREEN, textShadow: `0 0 10px ${SAFE_GREEN}77` }}
                data-testid="text-scam-percentage"
              >
                {value}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: `${SAFE_GREEN}66` }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-6 h-px" style={{ backgroundColor: `${SAFE_GREEN}20` }} />

      {/* ── Why it's safe + recommended action ── */}
      <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-3 animate-result-card-in delay-150">
        {result.whySuspicious && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ borderColor: `${SAFE_GREEN}28`, backgroundColor: `${SAFE_GREEN}08` }}
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: SAFE_GREEN }} />
              <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: SAFE_GREEN }}>
                Why It Looks Safe
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.whySuspicious}</p>
          </div>
        )}
        {result.recommendedAction && (
          <div
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{ borderColor: `${SAFE_GREEN}28`, backgroundColor: `${SAFE_GREEN}08` }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" style={{ color: SAFE_GREEN }} />
              <span className="font-mono text-xs uppercase tracking-widest font-bold" style={{ color: SAFE_GREEN }}>
                Recommended Action
              </span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{result.recommendedAction}</p>
          </div>
        )}
      </div>

      {/* ── Clean signals checklist ── */}
      {safeSignals.length > 0 && (
        <>
          <div className="mx-6 h-px" style={{ backgroundColor: `${SAFE_GREEN}20` }} />
          <div className="p-6 md:p-8 pt-4 space-y-3 animate-result-card-in delay-300">
            <h4 className="font-mono text-xs uppercase tracking-widest" style={{ color: `${SAFE_GREEN}77` }}>
              Verified Safe Signals
            </h4>
            <ul className="space-y-2">
              {safeSignals.map((sig, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border animate-rise-in"
                  style={{
                    backgroundColor: `${SAFE_GREEN}08`,
                    borderColor: `${SAFE_GREEN}22`,
                    animationDelay: `${300 + i * 60}ms`,
                  }}
                  data-testid={`item-indicator-${i}`}
                >
                  <CheckCircle
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: SAFE_GREEN, filter: `drop-shadow(0 0 4px ${SAFE_GREEN}88)` }}
                  />
                  <span className="text-sm text-foreground/80">{sig.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* ── Footer clearance stamp ── */}
      <div
        className="mx-6 mb-6 mt-1 rounded-xl py-3 px-4 flex items-center justify-between animate-result-card-in delay-450"
        style={{ backgroundColor: `${SAFE_GREEN}0a`, border: `1px solid ${SAFE_GREEN}22` }}
      >
        <span className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: `${SAFE_GREEN}66` }}>
          Sentinel AI Clearance
        </span>
        <span
          className="font-mono text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
          style={{ color: SAFE_GREEN, backgroundColor: `${SAFE_GREEN}18`, border: `1px solid ${SAFE_GREEN}44` }}
        >
          ✓ CLEARED
        </span>
      </div>
    </div>
  );
}

function InfoSection({
  label,
  value,
  icon: Icon,
  accentColor,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.01]"
      style={{ borderColor: `${accentColor}30`, backgroundColor: `${accentColor}08` }}
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 shrink-0" style={{ color: accentColor }} />
        <span
          className="font-mono text-xs uppercase tracking-widest font-bold"
          style={{ color: accentColor }}
        >
          {label}
        </span>
      </div>
      <p className="text-foreground/90 text-sm leading-relaxed">{value}</p>
    </div>
  );
}

const TECHNIQUE_META: Record<string, { label: string; icon: React.ElementType; color: string; bg: string; border: string }> = {
  urgency:               { label: "Urgency Tactics",         icon: Timer,         color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)" },
  suspicious_link:       { label: "Suspicious Link",         icon: ExternalLink,  color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  reward_bait:           { label: "Reward Bait",             icon: Gift,          color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)" },
  phishing_language:     { label: "Phishing Language",       icon: AlertTriangle, color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  otp_request:           { label: "OTP / Code Request",      icon: KeyRound,      color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  impersonation:         { label: "Impersonation",           icon: UserX,         color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  personal_info_request: { label: "Personal Info Request",   icon: CreditCard,    color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)" },
  fear_tactics:          { label: "Fear Tactics",            icon: ShieldAlert,   color: "#ef4444", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)" },
  too_good_to_be_true:   { label: "Too Good to Be True",     icon: AlertCircle,   color: "#f97316", bg: "rgba(249,115,22,0.08)",  border: "rgba(249,115,22,0.25)" },
};

function ResultSection({ result, themePrimary: _p }: { result: ScamAnalysis; themePrimary: string }) {
  if (result.scamPercentage <= 20) return <SafeResult result={result} />;

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
      className="mt-4 rounded-2xl border backdrop-blur-sm flex flex-col gap-0 overflow-hidden"
      style={getRiskBg(result.scamPercentage)}
      data-testid="section-result"
    >
      {/* Top: gauge + verdict — first to appear */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 p-6 md:p-8 animate-result-card-in delay-0">
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-foreground/10" />
              <circle
                cx="50" cy="50" r="40" fill="none"
                stroke={riskColor}
                strokeWidth="8"
                strokeDasharray={`${result.scamPercentage * 2.51} 251.2`}
                style={{
                  strokeLinecap: "round",
                  filter: `drop-shadow(0 0 6px ${riskColor})`,
                  transition: "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span
                className="text-4xl font-black"
                style={{ color: riskColor, textShadow: `0 0 12px ${riskColor}` }}
                data-testid="text-scam-percentage"
              >
                {result.scamPercentage}%
              </span>
              <span className="text-muted-foreground font-mono text-xs tracking-widest mt-1 uppercase">Risk Level</span>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2 text-center md:text-left justify-center">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
            <h2
              className="text-2xl md:text-3xl font-bold uppercase tracking-wide"
              style={{ color: riskColor, textShadow: `0 0 10px ${riskColor}88` }}
              data-testid="text-verdict"
            >
              {result.verdict.replace(/_/g, " ")}
            </h2>
            {result.threatType && (
              <span
                className="self-center md:self-auto px-3 py-1 rounded-full font-mono text-xs font-bold uppercase tracking-widest border"
                style={{ color: riskColor, borderColor: `${riskColor}55`, backgroundColor: `${riskColor}15` }}
                data-testid="text-threat-type"
              >
                {result.threatType}
              </span>
            )}
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed" data-testid="text-explanation">
            {result.explanation}
          </p>
        </div>
      </div>

      <div className="h-px mx-6" style={{ backgroundColor: `${riskColor}25` }} />

      {/* Info sections — stagger after gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-6 md:p-8 animate-result-card-in delay-150">
        {result.whySuspicious && (
          <InfoSection
            label={result.scamPercentage <= 20 ? "Why It Looks Safe" : "Why It Looks Suspicious"}
            value={result.whySuspicious}
            icon={result.scamPercentage <= 20 ? CheckCircle : AlertCircle}
            accentColor={riskColor}
          />
        )}
        {result.recommendedAction && (
          <InfoSection
            label="Recommended Action"
            value={result.recommendedAction}
            icon={ShieldCheck}
            accentColor={riskColor}
          />
        )}
      </div>

      {/* Technique tags */}
      {result.flaggedTechniques && result.flaggedTechniques.length > 0 && (
        <>
          <div className="h-px mx-6" style={{ backgroundColor: `${riskColor}25` }} />
          <div className="p-6 md:p-8 pt-5 space-y-3 animate-result-card-in delay-300">
            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Why This Was Flagged
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.flaggedTechniques.map((technique: string, ti: number) => {
                const meta = TECHNIQUE_META[technique];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <span
                    key={technique}
                    data-testid={`tag-technique-${technique}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold animate-rise-in"
                    style={{
                      color: meta.color,
                      backgroundColor: meta.bg,
                      borderColor: meta.border,
                      animationDelay: `${300 + ti * 60}ms`,
                    }}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    {meta.label}
                  </span>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Signal breakdown */}
      {result.indicators.length > 0 && (
        <>
          <div className="h-px mx-6" style={{ backgroundColor: `${riskColor}25` }} />
          <div className="p-6 md:p-8 pt-4 space-y-3 animate-result-card-in delay-450">
            <h4 className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
              Signal Breakdown
            </h4>
            <ul className="space-y-2">
              {result.indicators.map((indicator: ScamAnalysis["indicators"][number], index: number) => {
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
                    className="flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 hover:scale-[1.005] animate-rise-in"
                    style={{
                      backgroundColor: bg,
                      borderColor: border,
                      animationDelay: `${450 + Math.min(index * 55, 350)}ms`,
                    }}
                    data-testid={`item-indicator-${index}`}
                  >
                    <Icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color }} />
                    <span className="text-sm text-foreground/80">{indicator.description}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
