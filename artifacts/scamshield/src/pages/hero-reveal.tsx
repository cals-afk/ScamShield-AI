import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function HeroReveal() {
  const { theme, character, heroImageUrl } = useTheme();
  const [exiting, setExiting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const primary = theme?.primaryColor ?? "#00d4ff";

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 4600);
    return () => clearTimeout(exitTimer);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
    >
      {/* Ken Burns hero image */}
      {heroImageUrl && (
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={heroImageUrl}
            alt={character}
            onLoad={() => setImageLoaded(true)}
            className={[
              "w-full h-full object-cover object-center",
              "animate-ken-burns",
              imageLoaded
                ? exiting
                  ? "animate-hero-reveal-out"
                  : "animate-hero-reveal-in"
                : "opacity-0",
            ].join(" ")}
            style={{
              animationFillMode: "forwards",
            }}
          />
        </div>
      )}

      {/* Deep vignette overlay — dark edges, clear center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 80% at 50% 40%, transparent 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.92) 100%)`,
        }}
      />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/5 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.98) 0%, transparent 100%)",
        }}
      />

      {/* Top gradient fade */}
      <div
        className="absolute top-0 left-0 right-0 h-1/5 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)",
        }}
      />

      {/* Top-left status label */}
      <div
        className="absolute top-8 left-8 animate-hero-name-rise pointer-events-none"
      >
        <p
          className="font-mono text-xs tracking-[0.4em] uppercase"
          style={{ color: `${primary}88` }}
        >
          Identity Confirmed
        </p>
      </div>

      {/* Top-right corner accent */}
      <div
        className="absolute top-8 right-8 animate-hero-name-rise pointer-events-none flex items-center gap-2"
      >
        <div
          className="w-1.5 h-1.5 rounded-full animate-ping"
          style={{ backgroundColor: primary, animationDuration: "1.4s" }}
        />
        <p
          className="font-mono text-xs tracking-[0.3em] uppercase"
          style={{ color: `${primary}99` }}
        >
          {theme?.label ?? "HERO MODE"}
        </p>
      </div>

      {/* Bottom character name + tagline */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-12 pointer-events-none">
        <div className="animate-hero-name-rise">
          {/* Thin accent line */}
          <div
            className="w-16 h-px mb-5"
            style={{ backgroundColor: `${primary}88` }}
          />

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
            style={{
              color: `${primary}cc`,
              textShadow: `0 0 20px ${primary}66`,
            }}
          >
            {theme?.tagline ?? "System online."}
          </p>
        </div>
      </div>

      {/* Colour-tinted rim glow at bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${primary}18, transparent)`,
        }}
      />

      {/* Full-screen exit fade overlay */}
      {exiting && (
        <div
          className="absolute inset-0 bg-black animate-hero-reveal-in pointer-events-none"
          style={{ animationDuration: "1.2s" }}
        />
      )}
    </div>
  );
}
