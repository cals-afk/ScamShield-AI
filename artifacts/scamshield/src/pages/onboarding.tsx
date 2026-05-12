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
      className="group relative flex flex-col items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 focus:outline-none disabled:pointer-events-none"
      style={{
        borderColor: selected ? color : `${color}33`,
        backgroundColor: selected ? `${color}18` : `${color}08`,
        boxShadow: selected
          ? `0 0 28px ${color}55, inset 0 0 20px ${color}11`
          : `0 0 0px transparent`,
        transform: selected ? "scale(1.02)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}88`;
      }}
      onMouseLeave={(e) => {
        if (!selected)
          (e.currentTarget as HTMLButtonElement).style.borderColor = `${color}33`;
      }}
    >
      {/* Top: icon + label */}
      <div className="flex items-center gap-2.5 w-full">
        <div
          className="p-1.5 rounded-lg shrink-0"
          style={{
            backgroundColor: `${color}22`,
            color,
            filter: selected ? `drop-shadow(0 0 6px ${color}88)` : "none",
            transition: "filter 0.3s ease",
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
        <span
          className="font-mono text-xs font-bold tracking-widest uppercase leading-none"
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
            className="ml-auto w-1.5 h-1.5 rounded-full animate-ping shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
      </div>

      {/* Description */}
      <p
        className="font-mono text-[10px] leading-relaxed"
        style={{ color: `${color}88` }}
      >
        {mode.description}
      </p>

      {/* Bottom border glow sweep on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px rounded-full transition-all duration-500 group-hover:opacity-100"
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

    // Theme is pre-defined — no API call needed.
    // Transition immediately; image fetches in background.
    activateTheme(selected.name, selected.theme);

    void fetchHeroImage(selected).then((url) => {
      if (url) setHeroImage(url);
    });
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background overflow-hidden py-12 px-4">
      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      {/* Radial spotlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_40%,rgba(0,212,255,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8">
        {/* ── Header ── */}
        <div className="flex flex-col items-center gap-4 animate-rise-in">
          <div className="flex items-center gap-3">
            <Shield className="neon-shield w-8 h-8" />
            <span className="neon-title text-xl font-extrabold tracking-widest">SENTINEL AI</span>
          </div>
          <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
          <div className="text-center space-y-1">
            <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-muted-foreground">
              Guardian Calibration — v3.0
            </p>
            <h1 className="text-xl md:text-2xl font-bold font-mono text-foreground">
              Select Your{" "}
              <span className="text-primary">Sentinel Mode</span>
            </h1>
            <p className="text-xs text-muted-foreground font-mono max-w-sm">
              Each mode recalibrates your interface, threat analysis style, and defensive posture.
            </p>
          </div>
        </div>

        {/* ── Mode grid ── */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 animate-rise-in delay-200">
          {SENTINEL_MODES.map((mode) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              selected={selected?.id === mode.id}
              activating={activating}
              onSelect={handleSelect}
            />
          ))}
        </div>

        {/* ── Deploy button ── */}
        <div
          className="w-full max-w-xs transition-all duration-500"
          style={{
            opacity: selected ? 1 : 0.3,
            transform: selected ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <button
            onClick={() => void handleDeploy()}
            disabled={!selected || activating}
            className="group relative w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-bold uppercase tracking-widest text-sm overflow-hidden transition-all duration-300 disabled:cursor-not-allowed"
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
              <span className="relative flex items-center gap-2 font-mono">
                <Shield className="w-4 h-4" />
                Deploy {selected ? selected.name : "Mode"}
              </span>
            )}
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground/40 font-mono tracking-widest animate-rise-in delay-400">
          SENTINEL GRID ONLINE · {SENTINEL_MODES.length} MODES AVAILABLE
        </p>
      </div>
    </div>
  );
}
