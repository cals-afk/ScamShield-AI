import { useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Shield } from "lucide-react";
import { SENTINEL_MODES, type SentinelMode } from "@/sentinel-modes";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchHeroImage(mode: SentinelMode): Promise<string | undefined> {
  try {
    const res = await fetch(`${BASE}/api/hero/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character: mode.name,
        imagePrompt: mode.imagePrompt,
      }),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { imageUrl?: string };
    return data.imageUrl;
  } catch {
    return undefined;
  }
}

function ModeCard({
  mode,
  selected,
  activating,
  onSelect,
}: {
  mode: SentinelMode;
  selected: boolean;
  activating: boolean;
  onSelect: (mode: SentinelMode) => void;
}) {
  const Icon = mode.icon;
  const color = mode.theme.primaryColor;

  return (
    <button
      onClick={() => onSelect(mode)}
      disabled={activating}
      className="group relative flex flex-col items-start gap-2.5 p-3 sm:p-4 rounded-xl border text-left transition-all duration-300 focus:outline-none disabled:pointer-events-none w-full"
      style={{
        borderColor: selected ? color : `${color}33`,
        backgroundColor: selected ? `${color}18` : `${color}08`,
        boxShadow: selected
          ? `0 0 24px ${color}44, inset 0 0 16px ${color}0d`
          : "0 0 0px transparent",
        transform: selected ? "scale(1.02)" : "scale(1)",
        transition: "border-color 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}77`;
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}33`;
      }}
    >
      {/* Icon + name row */}
      <div className="flex items-center gap-2 w-full min-w-0">
        <div
          className="p-1.5 rounded-lg shrink-0"
          style={{
            backgroundColor: `${color}20`,
            color,
            filter: selected ? `drop-shadow(0 0 5px ${color}88)` : "none",
            transition: "filter 0.3s ease",
          }}
        >
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <span
          className="font-mono text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase leading-tight flex-1 min-w-0"
          style={{
            color: selected ? color : `${color}cc`,
            textShadow: selected ? `0 0 10px ${color}88` : "none",
            transition: "color 0.3s ease, text-shadow 0.3s ease",
          }}
        >
          {mode.name}
        </span>
        {selected && (
          <div
            className="w-1.5 h-1.5 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Description */}
      <p
        className="font-mono text-[9px] sm:text-[10px] leading-relaxed"
        style={{ color: `${color}77` }}
      >
        {mode.description}
      </p>

      {/* Bottom glow line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px rounded-full transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${color}88, transparent)`,
          opacity: selected ? 1 : 0,
        }}
      />
    </button>
  );
}

export default function Onboarding() {
  const [selected, setSelected] = useState<SentinelMode | null>(null);
  const [activating, setActivating] = useState(false);
  const { activateTheme, setHeroImage } = useTheme();

  const handleSelect = (mode: SentinelMode) => {
    if (activating) return;
    setSelected(mode);
  };

  const handleDeploy = async () => {
    if (!selected || activating) return;
    setActivating(true);
    activateTheme(selected.name, selected.theme);
    void fetchHeroImage(selected).then((url) => {
      if (url) setHeroImage(url);
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-start sm:justify-center bg-background overflow-hidden py-8 sm:py-12 px-4">
      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] sm:bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(0,212,255,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-6 sm:gap-8">

        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 animate-rise-in">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Shield className="neon-shield w-6 h-6 sm:w-8 sm:h-8" />
            <span className="neon-title text-lg sm:text-xl font-extrabold tracking-widest">SENTINEL AI</span>
          </div>
          <div className="w-48 sm:w-64 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
          <div className="text-center space-y-1 px-2">
            <p className="font-mono text-[9px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-muted-foreground">
              Guardian Calibration — v3.0
            </p>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-foreground">
              Select Your{" "}
              <span className="text-primary">Sentinel Mode</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono max-w-xs sm:max-w-sm">
              Each mode recalibrates your interface, threat analysis style, and defensive posture.
            </p>
          </div>
        </div>

        {/* ── Mode grid ──
            1 col on phones < 480px, 2 cols on 480-639px, 3 cols on 640px+ */}
        <div className="w-full grid grid-cols-1 min-[480px]:grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 animate-rise-in delay-200">
          {SENTINEL_MODES.map((mode, idx) => {
            const isLoneMobile = SENTINEL_MODES.length % 2 !== 0 && idx === SENTINEL_MODES.length - 1;
            return (
              <div
                key={mode.id}
                className={isLoneMobile ? "min-[480px]:max-sm:col-span-2" : ""}
              >
                <ModeCard
                  mode={mode}
                  selected={selected?.id === mode.id}
                  activating={activating}
                  onSelect={handleSelect}
                />
              </div>
            );
          })}
        </div>

        {/* ── Deploy button ── */}
        <div
          className="w-full sm:max-w-xs transition-all duration-500"
          style={{
            opacity: selected ? 1 : 0.35,
            transform: selected ? "translateY(0)" : "translateY(6px)",
          }}
        >
          <button
            onClick={() => void handleDeploy()}
            disabled={!selected || activating}
            className="group relative w-full flex items-center justify-center gap-2.5 py-3.5 sm:py-3.5 px-6 rounded-xl font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-300 disabled:cursor-not-allowed touch-manipulation"
            style={{
              backgroundColor: selected?.theme.primaryColor ?? "#00d4ff",
              color: selected?.theme.backgroundColor ?? "#030f14",
              boxShadow: activating
                ? `0 0 40px ${selected?.theme.primaryColor ?? "#00d4ff"}88`
                : `0 0 20px ${selected?.theme.primaryColor ?? "#00d4ff"}55`,
              opacity: selected ? 1 : 0.5,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {activating ? (
              <span className="relative flex items-center gap-2 font-mono text-xs">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </span>
                Deploying {selected?.name}...
              </span>
            ) : (
              <span className="relative flex items-center gap-2 font-mono text-xs sm:text-sm">
                <Shield className="w-4 h-4 shrink-0" />
                Deploy {selected ? selected.name : "Mode"}
              </span>
            )}
          </button>
        </div>

        <p className="text-[9px] sm:text-[10px] text-muted-foreground/40 font-mono tracking-widest animate-rise-in delay-400 text-center">
          SENTINEL GRID ONLINE · {SENTINEL_MODES.length} MODES AVAILABLE
        </p>
      </div>
    </div>
  );
}
