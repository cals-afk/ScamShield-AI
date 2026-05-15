import { useEffect, useState } from "react";
import { Shield, ChevronRight } from "lucide-react";
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

const STATUS_BADGES = [
  { label: "Shields", value: "Online" },
  { label: "AI Core", value: "Ready" },
  { label: "Grid", value: "Active" },
];

export default function Splash() {
  const { exitSplash } = useTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const [statusReady, setStatusReady] = useState(false);
  const [buttonReady, setButtonReady] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const lineDelays = [350, 750, 1150, 1600, 2050, 2600];
    const lineTimers = lineDelays.map((d, i) =>
      setTimeout(() => setVisibleLines(i + 1), d),
    );
    const statusTimer = setTimeout(() => setStatusReady(true), 3050);
    const buttonTimer = setTimeout(() => setButtonReady(true), 3600);
    return () => {
      lineTimers.forEach(clearTimeout);
      clearTimeout(statusTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnter = () => {
    if (!buttonReady) return;
    setExiting(true);
    setTimeout(() => exitSplash(), 550);
  };

  const progress = Math.round((visibleLines / BOOT_LINES.length) * 100);
  const allDone = visibleLines >= BOOT_LINES.length;

  return (
    <div
      className={`fixed inset-0 z-10 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-8 ${
        exiting ? "animate-page-exit" : "animate-page-enter"
      }`}
      style={{ backgroundColor: BG }}
    >
      {/* Animated grid */}
      <div className="animate-grid-drift pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.045)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Ambient center glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 65% 60% at 50% 42%, ${PRIMARY}10 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-5 w-full max-w-lg">

        {/* ── Top status badge ── */}
        <div className="flex items-center gap-2 animate-rise-in">
          <div className="w-1.5 h-1.5 rounded-full animate-hud-blink" style={{ backgroundColor: PRIMARY }} />
          <span
            className="font-mono text-[10px] sm:text-xs tracking-[0.35em] uppercase"
            style={{ color: `${PRIMARY}88` }}
          >
            {allDone ? "System Online" : "Initializing..."}
          </span>
          <div
            className="w-1.5 h-1.5 rounded-full animate-hud-blink"
            style={{ backgroundColor: PRIMARY, animationDelay: "0.55s" }}
          />
        </div>

        {/* ── Shield + orbital rings ── */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: "clamp(140px, 35vw, 200px)", height: "clamp(140px, 35vw, 200px)" }}
        >
          {/* Outer dashed ring — CW slow */}
          <svg
            className="absolute inset-0 w-full h-full animate-spin-slow"
            style={{ animationDuration: "15s" }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}44`} strokeWidth="0.8" strokeDasharray="4 9" />
            <circle cx="50" cy="3" r="1.8" fill={PRIMARY} opacity="0.85" />
          </svg>

          {/* Middle dashed ring — CCW */}
          <svg
            className="absolute inset-[10%] w-[80%] h-[80%]"
            style={{ animation: "orbit-ccw 10s linear infinite" }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}33`} strokeWidth="0.6" strokeDasharray="7 14" />
            <circle cx="50" cy="3" r="2" fill={PRIMARY} opacity="0.65" />
          </svg>

          {/* Inner ring — CW fast */}
          <svg
            className="absolute inset-[22%] w-[56%] h-[56%] animate-spin-slow"
            style={{ animationDuration: "5s" }}
            viewBox="0 0 100 100"
          >
            <circle cx="50" cy="50" r="47" fill="none" stroke={`${PRIMARY}22`} strokeWidth="0.5" strokeDasharray="2 7" />
          </svg>

          {/* Radar sweep */}
          <div
            className="absolute inset-[12%] rounded-full overflow-hidden animate-spin-slow"
            style={{ animationDuration: "3.5s" }}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, transparent 0deg, ${PRIMARY}08 55deg, ${PRIMARY}28 78deg, ${PRIMARY}44 88deg, ${PRIMARY}00 92deg, transparent 360deg)`,
              }}
            />
          </div>

          {/* Pulse ring */}
          <div
            className="absolute inset-[25%] rounded-full animate-ping"
            style={{ border: `1px solid ${PRIMARY}33`, animationDuration: "3.2s" }}
          />

          {/* Solid inner disc */}
          <div
            className="absolute inset-[35%] rounded-full"
            style={{ backgroundColor: `${PRIMARY}08`, border: `1px solid ${PRIMARY}22` }}
          />

          {/* Shield icon */}
          <Shield
            className="relative z-10"
            style={{
              width: "clamp(40px, 10vw, 58px)",
              height: "clamp(40px, 10vw, 58px)",
              color: PRIMARY,
              filter: `drop-shadow(0 0 10px ${PRIMARY}) drop-shadow(0 0 28px ${PRIMARY}88)`,
              animation: "shield-glow-pulse 3s ease-in-out infinite",
            }}
          />
        </div>

        {/* ── Title + subtitle ── */}
        <div className="text-center animate-rise-in delay-100">
          <h1
            className="neon-title text-4xl sm:text-5xl font-extrabold tracking-tight leading-none"
            style={{
              color: PRIMARY,
              textShadow: `0 0 10px ${PRIMARY}, 0 0 30px ${PRIMARY}99, 0 0 60px ${PRIMARY}55`,
            }}
          >
            SENTINEL AI
          </h1>
          <p
            className="font-mono text-[9px] sm:text-[10px] tracking-[0.35em] uppercase mt-2"
            style={{ color: `${PRIMARY}66` }}
          >
            Guardian Protocol v3.0 // Threat Detection System
          </p>
        </div>

        {/* ── Terminal boot window ── */}
        <div
          className="w-full rounded-xl border overflow-hidden animate-rise-in delay-200"
          style={{ borderColor: `${PRIMARY}28`, backgroundColor: `${PRIMARY}05` }}
        >
          {/* Header bar */}
          <div
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 border-b"
            style={{ borderColor: `${PRIMARY}18`, backgroundColor: `${PRIMARY}08` }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}55` }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}33` }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `${PRIMARY}22` }} />
            <span
              className="ml-2 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase"
              style={{ color: `${PRIMARY}55` }}
            >
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
                  <span
                    className="flex-1"
                    style={{
                      color: isCurrent && !isLast ? PRIMARY : `${PRIMARY}77`,
                      textShadow: isCurrent && isLast ? `0 0 8px ${PRIMARY}66` : "none",
                      transition: "color 0.3s",
                    }}
                  >
                    {line}
                  </span>
                  <span className="shrink-0 font-bold ml-auto" style={{ minWidth: 12 }}>
                    {isDone && !isLast && (
                      <span style={{ color: `${PRIMARY}66` }}>✓</span>
                    )}
                    {isLast && isVisible && (
                      <span
                        style={{
                          color: PRIMARY,
                          textShadow: `0 0 8px ${PRIMARY}`,
                        }}
                      >
                        ●
                      </span>
                    )}
                    {isCurrent && !isLast && (
                      <span className="animate-terminal-blink" style={{ color: PRIMARY }}>_</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mx-3 sm:mx-4 mb-3 h-px overflow-hidden rounded-full" style={{ backgroundColor: `${PRIMARY}15` }}>
            <div
              className="h-full rounded-full relative overflow-hidden"
              style={{
                width: `${progress}%`,
                backgroundColor: PRIMARY,
                boxShadow: `0 0 8px ${PRIMARY}88`,
                transition: "width 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                className="absolute inset-0 animate-shimmer-h"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.38), transparent)" }}
              />
            </div>
          </div>
        </div>

        {/* ── Status indicators ── */}
        <div
          className="flex items-center justify-center gap-4 sm:gap-6 transition-all duration-500"
          style={{
            opacity: statusReady ? 1 : 0,
            transform: statusReady ? "none" : "translateY(8px)",
          }}
        >
          {STATUS_BADGES.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-hud-blink"
                style={{ backgroundColor: PRIMARY, animationDelay: `${i * 0.35}s` }}
              />
              <span
                className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider"
                style={{ color: `${PRIMARY}55` }}
              >
                {s.label}
              </span>
              <span
                className="font-mono text-[9px] sm:text-[10px] uppercase tracking-wider font-bold"
                style={{ color: PRIMARY, textShadow: `0 0 6px ${PRIMARY}88` }}
              >
                {s.value}
              </span>
            </div>
          ))}
        </div>

        {/* ── Initialize button ── */}
        <div
          className="w-full transition-all duration-700"
          style={{
            opacity: buttonReady ? 1 : 0,
            transform: buttonReady ? "none" : "translateY(14px) scale(0.96)",
          }}
        >
          <button
            onClick={handleEnter}
            disabled={!buttonReady || exiting}
            className="group relative w-full flex items-center justify-center gap-3 py-3.5 sm:py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-xs sm:text-sm overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 touch-manipulation disabled:pointer-events-none"
            style={{
              backgroundColor: PRIMARY,
              color: BG,
              boxShadow: `0 0 24px ${PRIMARY}55, 0 0 50px ${PRIMARY}22, inset 0 1px 0 rgba(255,255,255,0.15)`,
            }}
          >
            {/* Shimmer on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/22 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 relative z-10" />
            <span className="relative z-10 font-mono">Initialize Guardian System</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          <p
            className="text-center font-mono text-[9px] tracking-[0.3em] uppercase mt-2"
            style={{ color: `${PRIMARY}44` }}
          >
            — Select your sentinel mode —
          </p>
        </div>
      </div>
    </div>
  );
}
