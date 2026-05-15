import { useEffect, useState, useCallback } from "react";
import { Shield, ChevronRight, Loader2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PRIMARY = "#00d4ff";
const BG = "#030f14";

const BOOT_LINES = [
  "Initializing core threat detection system",
  "Connecting to intelligence network relay",
  "Loading neural pattern analysis engine",
  "Calibrating deception detection modules",
  "Arming guardian protocols",
  "All systems nominal — GUARDIAN READY",
];

type TransPhase = "idle" | "charging" | "flashing";

function randomHex(len = 8) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();
}

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

/** Tiny EQ signal bars */
function SignalBars({ active }: { active: boolean }) {
  const heights = [3, 5, 7, 5, 3, 6, 8, 4, 7, 5];
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 12 }}>
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[2px] rounded-full"
          style={{
            height: active ? h : 3,
            backgroundColor: PRIMARY,
            opacity: active ? 0.6 + (i % 3) * 0.13 : 0.2,
            transition: `height ${0.3 + i * 0.04}s ease, opacity 0.3s`,
            animation: active ? `eq-bar ${0.6 + (i % 4) * 0.18}s ease-in-out ${i * 0.06}s infinite alternate` : "none",
          }}
        />
      ))}
    </div>
  );
}

export default function Splash() {
  const { exitSplash } = useTheme();

  /* ── Boot sequence ── */
  const [visibleLines, setVisibleLines] = useState(0);
  const [statusReady, setStatusReady] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);

  /* ── Transition ── */
  const [transPhase, setTransPhase] = useState<TransPhase>("idle");

  /* ── Live data ── */
  const [threatCount, setThreatCount] = useState(1_247_329);
  const [nodeAddr, setNodeAddr] = useState(() => randomHex());
  const [sessionKey, setSessionKey] = useState(() => randomHex(12));

  /* ── Boot timers ── */
  useEffect(() => {
    const lineDelays = [350, 750, 1150, 1600, 2050, 2600];
    const timers = lineDelays.map((d, i) =>
      setTimeout(() => setVisibleLines(i + 1), d),
    );
    const s = setTimeout(() => setStatusReady(true), 3050);
    const b = setTimeout(() => setButtonReady(true), 3600);
    return () => { timers.forEach(clearTimeout); clearTimeout(s); clearTimeout(b); };
  }, []);

  /* ── Live threat counter ── */
  useEffect(() => {
    const id = setInterval(() => {
      setThreatCount(c => c + Math.floor(Math.random() * 5 + 1));
    }, 65);
    return () => clearInterval(id);
  }, []);

  /* ── Node address + session key flicker ── */
  useEffect(() => {
    const addr = setInterval(() => setNodeAddr(randomHex()), 2200);
    const sess = setInterval(() => setSessionKey(randomHex(12)), 4500);
    return () => { clearInterval(addr); clearInterval(sess); };
  }, []);

  /* ── Transition handler ── */
  const handleEnter = useCallback(() => {
    if (!buttonReady || transPhase !== "idle") return;
    setTransPhase("charging");
    setTimeout(() => setTransPhase("flashing"), 1150);
    setTimeout(() => exitSplash(), 1800);
  }, [buttonReady, transPhase, exitSplash]);

  const progress = Math.round((visibleLines / BOOT_LINES.length) * 100);
  const allDone = visibleLines >= BOOT_LINES.length;
  const isCharging = transPhase === "charging";
  const isFlashing = transPhase === "flashing";

  return (
    <>
      {/* ── Full-screen flash overlay — sits above everything ── */}
      {isFlashing && (
        <div
          className="fixed inset-0 z-50 pointer-events-none animate-boot-flash-out"
        />
      )}

      <div
        className="fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-8 animate-page-enter"
        style={{
          backgroundColor: BG,
          transition: "transform 0.5s ease, filter 0.5s ease",
          transform: isFlashing ? "scale(1.04)" : "scale(1)",
          filter: isFlashing ? "brightness(1.4) blur(1px)" : "none",
        }}
      >
        {/* Animated grid */}
        <div className="animate-grid-drift pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Ambient center glow */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse 65% 60% at 50% 42%, ${PRIMARY}${isCharging ? "22" : "10"} 0%, transparent 70%)`,
          }}
        />

        {/* Corner data displays */}
        <div className="absolute top-10 left-5 sm:left-8 pointer-events-none animate-rise-in delay-1000 hidden sm:block">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[7px] tracking-[0.3em] uppercase" style={{ color: `${PRIMARY}44` }}>Node</span>
            <span className="font-mono text-[8px] tracking-widest" style={{ color: `${PRIMARY}66` }}>{nodeAddr}</span>
          </div>
        </div>
        <div className="absolute top-10 right-5 sm:right-8 pointer-events-none animate-rise-in delay-1000 hidden sm:block">
          <div className="flex flex-col gap-0.5 items-end">
            <span className="font-mono text-[7px] tracking-[0.3em] uppercase" style={{ color: `${PRIMARY}44` }}>Session</span>
            <span className="font-mono text-[8px] tracking-widest" style={{ color: `${PRIMARY}55` }}>{sessionKey}</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 w-full max-w-lg">

          {/* ── Top status badge ── */}
          <div className="flex items-center gap-2.5 animate-rise-in">
            <div className="w-1.5 h-1.5 rounded-full animate-hud-blink" style={{ backgroundColor: PRIMARY }} />
            <span className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase" style={{ color: `${PRIMARY}88` }}>
              {isCharging ? "Deploying Guardian..." : allDone ? "System Online" : "Initializing..."}
            </span>
            <SignalBars active={allDone} />
            <div className="w-1.5 h-1.5 rounded-full animate-hud-blink" style={{ backgroundColor: PRIMARY, animationDelay: "0.55s" }} />
          </div>

          {/* ── Shield + orbital rings ── */}
          <div
            className="relative flex items-center justify-center"
            style={{ width: "clamp(140px, 35vw, 200px)", height: "clamp(140px, 35vw, 200px)" }}
          >
            {/* Outer ring — CW slow, accelerates on charging */}
            <svg
              className="absolute inset-0 w-full h-full animate-spin-slow"
              style={{ animationDuration: isCharging ? "4s" : "15s", transition: "animation-duration 0.6s" }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}${isCharging ? "77" : "44"}`} strokeWidth="0.8" strokeDasharray="4 9" />
              <circle cx="50" cy="3" r="1.8" fill={PRIMARY} opacity="0.85" />
            </svg>

            {/* Middle ring — CCW, accelerates on charging */}
            <svg
              className="absolute inset-[10%] w-[80%] h-[80%]"
              style={{ animation: `orbit-ccw ${isCharging ? "3s" : "10s"} linear infinite`, transition: "animation-duration 0.6s" }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}${isCharging ? "66" : "33"}`} strokeWidth="0.6" strokeDasharray="7 14" />
              <circle cx="50" cy="3" r="2" fill={PRIMARY} opacity="0.65" />
            </svg>

            {/* Inner ring — CW fast */}
            <svg
              className="absolute inset-[22%] w-[56%] h-[56%] animate-spin-slow"
              style={{ animationDuration: isCharging ? "1.5s" : "5s" }}
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}${isCharging ? "55" : "22"}`} strokeWidth="0.5" strokeDasharray="2 7" />
            </svg>

            {/* Radar sweep */}
            <div
              className="absolute inset-[12%] rounded-full overflow-hidden animate-spin-slow"
              style={{ animationDuration: isCharging ? "0.9s" : "3.5s" }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, ${PRIMARY}${isCharging ? "18" : "08"} 55deg, ${PRIMARY}${isCharging ? "55" : "28"} 78deg, ${PRIMARY}${isCharging ? "88" : "44"} 88deg, ${PRIMARY}00 92deg, transparent 360deg)`,
                }}
              />
            </div>

            {/* Charging burst rings — appear only when charging */}
            {isCharging && (
              <>
                <div className="absolute inset-[5%] rounded-full animate-ping" style={{ border: `1px solid ${PRIMARY}44`, animationDuration: "0.7s" }} />
                <div className="absolute inset-[15%] rounded-full animate-ping" style={{ border: `1px solid ${PRIMARY}33`, animationDuration: "0.9s", animationDelay: "0.15s" }} />
              </>
            )}

            {/* Pulse ring */}
            <div
              className="absolute inset-[25%] rounded-full animate-ping"
              style={{ border: `1px solid ${PRIMARY}33`, animationDuration: isCharging ? "0.8s" : "3.2s" }}
            />

            {/* Inner disc */}
            <div
              className="absolute inset-[35%] rounded-full transition-all duration-500"
              style={{
                backgroundColor: `${PRIMARY}${isCharging ? "18" : "08"}`,
                border: `1px solid ${PRIMARY}${isCharging ? "55" : "22"}`,
                boxShadow: isCharging ? `0 0 20px ${PRIMARY}44` : "none",
              }}
            />

            {/* Shield icon */}
            <Shield
              className="relative z-10 transition-all duration-500"
              style={{
                width: "clamp(40px, 10vw, 58px)",
                height: "clamp(40px, 10vw, 58px)",
                color: PRIMARY,
                filter: isCharging
                  ? `drop-shadow(0 0 18px ${PRIMARY}) drop-shadow(0 0 40px ${PRIMARY}cc)`
                  : `drop-shadow(0 0 10px ${PRIMARY}) drop-shadow(0 0 28px ${PRIMARY}88)`,
                animation: "shield-glow-pulse 3s ease-in-out infinite",
              }}
            />
          </div>

          {/* ── Title + subtitle ── */}
          <div className="text-center animate-rise-in delay-100">
            <h1
              className="neon-title text-4xl sm:text-5xl font-extrabold tracking-tight leading-none animate-title-glitch"
              style={{
                color: PRIMARY,
                textShadow: `0 0 10px ${PRIMARY}, 0 0 30px ${PRIMARY}99, 0 0 60px ${PRIMARY}55`,
              }}
            >
              SENTINEL AI
            </h1>
            <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase mt-2" style={{ color: `${PRIMARY}66` }}>
              Guardian Protocol v3.0 // Threat Detection System
            </p>
          </div>

          {/* ── Terminal boot window ── */}
          <div
            className="w-full rounded-xl border overflow-hidden animate-rise-in delay-200 transition-all duration-500"
            style={{
              borderColor: isCharging ? `${PRIMARY}55` : `${PRIMARY}28`,
              backgroundColor: `${PRIMARY}05`,
              boxShadow: isCharging ? `0 0 20px ${PRIMARY}22` : "none",
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b"
              style={{ borderColor: `${PRIMARY}18`, backgroundColor: `${PRIMARY}08` }}
            >
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}55` }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}33` }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}22` }} />
              <span className="ml-2 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase" style={{ color: `${PRIMARY}55` }}>
                SENTINEL // BOOT SEQUENCE
              </span>
              <span
                className="ml-auto font-mono text-[9px] sm:text-[10px] font-bold tabular-nums"
                style={{
                  color: progress === 100 ? PRIMARY : `${PRIMARY}77`,
                  textShadow: progress === 100 ? `0 0 8px ${PRIMARY}` : "none",
                  transition: "color 0.4s, text-shadow 0.4s",
                }}
              >
                {progress}%
              </span>
            </div>

            {/* Boot lines */}
            <div className="p-3 sm:p-4 space-y-1.5 sm:space-y-2" style={{ minHeight: "clamp(120px, 22vh, 160px)" }}>
              {BOOT_LINES.map((line, i) => {
                const isVisible = i < visibleLines;
                const isCurrent = i === visibleLines - 1;
                const isDone = isVisible && !isCurrent;
                const isLast = i === BOOT_LINES.length - 1;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "none" : "translateY(4px)",
                      transition: "opacity 0.35s ease, transform 0.35s ease",
                    }}
                  >
                    <span style={{ color: `${PRIMARY}44` }} className="shrink-0">›</span>
                    <span className="flex-1" style={{ color: isCurrent && !isLast ? PRIMARY : `${PRIMARY}77`, transition: "color 0.3s" }}>
                      {line}
                    </span>
                    <span className="shrink-0 font-bold ml-auto" style={{ minWidth: 12 }}>
                      {isDone && !isLast && <span style={{ color: `${PRIMARY}66` }}>✓</span>}
                      {isLast && isVisible && <span style={{ color: PRIMARY, textShadow: `0 0 8px ${PRIMARY}` }}>●</span>}
                      {isCurrent && !isLast && <span className="animate-terminal-blink" style={{ color: PRIMARY }}>_</span>}
                    </span>
                  </div>
                );
              })}

              {/* Charging extra line */}
              {isCharging && (
                <div
                  className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs animate-rise-in"
                  style={{ animationDuration: "0.3s" }}
                >
                  <span style={{ color: `${PRIMARY}44` }} className="shrink-0">›</span>
                  <span className="flex-1" style={{ color: PRIMARY, textShadow: `0 0 6px ${PRIMARY}88` }}>
                    Activating guardian mode selector...
                  </span>
                  <span className="animate-terminal-blink shrink-0" style={{ color: PRIMARY }}>_</span>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mx-3 sm:mx-4 mb-3 h-px overflow-hidden rounded-full" style={{ backgroundColor: `${PRIMARY}15` }}>
              <div
                className="h-full rounded-full relative overflow-hidden transition-all"
                style={{
                  width: isCharging ? "100%" : `${progress}%`,
                  backgroundColor: PRIMARY,
                  boxShadow: `0 0 ${isCharging ? "16px" : "8px"} ${PRIMARY}88`,
                  transition: isCharging ? "width 0.4s ease, box-shadow 0.3s" : "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <div className="absolute inset-0 animate-shimmer-h" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)" }} />
              </div>
            </div>
          </div>

          {/* ── Status row + live threat counter ── */}
          <div
            className="w-full flex flex-col items-center gap-2.5 transition-all duration-500"
            style={{ opacity: statusReady ? 1 : 0, transform: statusReady ? "none" : "translateY(8px)" }}
          >
            {/* Status badges */}
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {[
                { label: "Shields", value: "Online" },
                { label: "AI Core", value: "Ready" },
                { label: "Grid", value: "Active" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full animate-hud-blink" style={{ backgroundColor: PRIMARY, animationDelay: `${i * 0.35}s` }} />
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider" style={{ color: `${PRIMARY}55` }}>{s.label}</span>
                  <span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold" style={{ color: PRIMARY, textShadow: `0 0 6px ${PRIMARY}88` }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Live threat counter */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
              style={{ borderColor: `${PRIMARY}22`, backgroundColor: `${PRIMARY}06` }}
            >
              <div className="w-1 h-1 rounded-full animate-ping" style={{ backgroundColor: PRIMARY, animationDuration: "1.2s" }} />
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: `${PRIMARY}55` }}>Threats Neutralized</span>
              <span
                className="font-mono text-[10px] sm:text-xs font-bold tabular-nums"
                style={{ color: PRIMARY, textShadow: `0 0 8px ${PRIMARY}88`, minWidth: "6ch" }}
              >
                {fmt(threatCount)}
              </span>
            </div>
          </div>

          {/* ── Initialize button ── */}
          <div
            className="w-full transition-all duration-700"
            style={{
              opacity: buttonReady ? 1 : 0,
              transform: buttonReady ? "none" : "translateY(14px) scale(0.96)",
            }}
          >
            <div className="relative">
              {/* Charging ring around button */}
              {isCharging && (
                <div
                  className="absolute -inset-[3px] rounded-[14px] pointer-events-none"
                  style={{
                    border: `1.5px dashed ${PRIMARY}`,
                    animation: "spin-slow 1.2s linear infinite",
                    opacity: 0.7,
                  }}
                />
              )}

              <button
                onClick={handleEnter}
                disabled={!buttonReady || transPhase !== "idle"}
                className="relative w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs sm:text-sm overflow-hidden touch-manipulation disabled:pointer-events-none transition-all duration-300"
                style={{
                  backgroundColor: PRIMARY,
                  color: BG,
                  boxShadow: isCharging
                    ? `0 0 40px ${PRIMARY}99, 0 0 80px ${PRIMARY}44, inset 0 1px 0 rgba(255,255,255,0.2)`
                    : `0 0 24px ${PRIMARY}55, 0 0 50px ${PRIMARY}22, inset 0 1px 0 rgba(255,255,255,0.15)`,
                  animation: isCharging ? "charge-glow 0.45s ease-in-out infinite" : "none",
                  transform: "translateZ(0)",
                }}
              >
                {/* Shimmer on hover */}
                {!isCharging && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                )}

                {isCharging ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 relative z-10 animate-spin" />
                    <span className="relative z-10 font-mono">Initializing...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 relative z-10" />
                    <span className="relative z-10 font-mono">Initialize Guardian System</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>

            <p className="text-center font-mono text-[9px] tracking-[0.3em] uppercase mt-2" style={{ color: `${PRIMARY}44` }}>
              — Select your sentinel mode —
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
