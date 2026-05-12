import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

/** Lightweight hero silhouette — always rendered as the base layer */
function HeroSilhouette({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 220 480"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      fill={color}
    >
      <ellipse cx="110" cy="52" rx="34" ry="38" />
      <rect x="97" y="84" width="26" height="18" rx="6" />
      <path d="M60 110 Q75 102 97 100 L113 100 Q135 102 160 110 L152 210 Q130 220 110 220 Q90 220 68 210 Z" />
      <path d="M60 110 L22 185 Q18 200 28 205 L42 210 L72 145 Z" />
      <ellipse cx="25" cy="207" rx="14" ry="12" />
      <path d="M160 110 L198 185 Q202 200 192 205 L178 210 L148 145 Z" />
      <ellipse cx="195" cy="207" rx="14" ry="12" />
      <rect x="72" y="207" width="76" height="14" rx="4" opacity="0.9" />
      <path d="M72 218 L62 360 Q60 378 75 380 L95 380 L108 260 L108 218 Z" />
      <path d="M62 362 Q58 395 72 400 L98 400 L98 375 Z" />
      <path d="M148 218 L158 360 Q160 378 145 380 L125 380 L112 260 L112 218 Z" />
      <path d="M158 362 Q162 395 148 400 L122 400 L122 375 Z" />
      <path d="M60 110 Q10 180 0 420 Q55 370 110 400 Q165 370 220 420 Q210 180 160 110 Q130 130 110 130 Q90 130 60 110 Z" opacity="0.4" />
    </svg>
  );
}

export default function HeroReveal() {
  const { theme, character, heroImageUrl } = useTheme();
  const [exiting, setExiting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [silhouetteVisible, setSilhouetteVisible] = useState(false);

  const primary = theme?.primaryColor ?? "#00d4ff";

  useEffect(() => {
    // Silhouette fades in shortly after mount
    const silTimer = setTimeout(() => setSilhouetteVisible(true), 300);
    // Begin exit fade before ThemeContext transitions away
    const exitTimer = setTimeout(() => setExiting(true), 4500);
    // Full black overlay just before transition completes
    const overlayTimer = setTimeout(() => setShowOverlay(true), 4900);
    return () => {
      clearTimeout(silTimer);
      clearTimeout(exitTimer);
      clearTimeout(overlayTimer);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden animate-hero-reveal-in"
      style={{ backgroundColor: theme?.backgroundColor ?? "#0a0e1a" }}
    >
      {/* ── Ambient radial glow behind the silhouette ── */}
      <div
        className="animate-hero-glow-pulse pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(70vw, 500px)",
          height: "min(90vh, 700px)",
          background: `radial-gradient(ellipse 60% 80% at 50% 85%, ${primary}44 0%, transparent 70%)`,
          filter: "blur(50px)",
        }}
      />

      {/* ── Hero silhouette — always visible for every character ── */}
      <div
        className="animate-hero-breathe pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(48vw, 300px)",
          height: "min(78vh, 540px)",
          opacity: silhouetteVisible ? 1 : 0,
          filter: `drop-shadow(0 0 30px ${primary}99) drop-shadow(0 0 70px ${primary}44)`,
          transition: "opacity 1.6s ease",
        }}
      >
        <HeroSilhouette color={primary} />
      </div>

      {/* ── Hero photo — fades in on top when the background fetch completes ── */}
      {heroImageUrl && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <img
            src={heroImageUrl}
            alt={character}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-center animate-ken-burns ${
              exiting ? "animate-hero-reveal-out" : ""
            }`}
            style={{ animationFillMode: "forwards" }}
          />
        </div>
      )}

      {/* ── Scan line effect over silhouette ── */}
      <div
        className="pointer-events-none absolute inset-0 animate-scan-sweep"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, ${primary}18 48%, ${primary}33 50%, ${primary}18 52%, transparent 100%)`,
        }}
      />

      {/* Deep vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 80% at 50% 40%, transparent 20%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.9) 100%)`,
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, transparent 100%)" }}
      />
      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 h-1/5 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)" }}
      />

      {/* ── Top-left label ── */}
      <div className="absolute top-8 left-8 pointer-events-none animate-slide-left-in delay-800">
        <p className="font-mono text-xs tracking-[0.4em] uppercase" style={{ color: `${primary}88` }}>
          Identity Confirmed
        </p>
      </div>

      {/* ── Top-right label ── */}
      <div className="absolute top-8 right-8 pointer-events-none flex items-center gap-2 animate-slide-right-in delay-900">
        <div
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: primary, animationDuration: "1.4s" }}
        />
        <p className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: `${primary}99` }}>
          {theme?.label ?? "HERO MODE"}
        </p>
      </div>

      {/* ── Bottom: character name + tagline ── */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 pointer-events-none">
        <div className="animate-hero-name-rise">
          <div className="w-16 h-px mb-5" style={{ backgroundColor: `${primary}88` }} />
          <h1
            className="text-5xl md:text-7xl font-black tracking-wider uppercase leading-none mb-3"
            style={{
              color: "#ffffff",
              textShadow: `0 0 40px ${primary}88, 0 0 80px ${primary}44, 0 2px 4px rgba(0,0,0,0.9)`,
              fontFamily: "var(--app-font-sans)",
            }}
          >
            {character.toUpperCase()}
          </h1>
          <p
            className="font-mono text-sm tracking-[0.25em] uppercase"
            style={{ color: `${primary}cc`, textShadow: `0 0 20px ${primary}66` }}
          >
            {theme?.tagline ?? "System online."}
          </p>
        </div>
      </div>

      {/* Rim glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: `linear-gradient(to top, ${primary}18, transparent)` }}
      />

      {/* Exit fade to black */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black animate-hero-reveal-in pointer-events-none"
          style={{ animationDuration: "0.9s" }}
        />
      )}
    </div>
  );
}
