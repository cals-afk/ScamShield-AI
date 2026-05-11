import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Shield } from "lucide-react";

const STEPS = [
  { label: "Scanning identity matrix", delay: 0 },
  { label: "Loading signature palette", delay: 600 },
  { label: "Calibrating threat protocols", delay: 1200 },
  { label: "Synchronising neural interface", delay: 1800 },
  { label: "System online", delay: 2600 },
];

function HeroSilhouette({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 220 480"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      fill={color}
    >
      {/* Cape — behind everything */}
      <path d="M60 110 Q10 180 0 420 Q55 370 110 400 Q165 370 220 420 Q210 180 160 110 Q130 130 110 130 Q90 130 60 110 Z" opacity="0.7" />

      {/* Head */}
      <ellipse cx="110" cy="52" rx="34" ry="38" />

      {/* Neck */}
      <rect x="97" y="84" width="26" height="18" rx="6" />

      {/* Chest / torso */}
      <path d="M60 110 Q75 102 97 100 L113 100 Q135 102 160 110 L152 210 Q130 220 110 220 Q90 220 68 210 Z" />

      {/* Left arm */}
      <path d="M60 110 L22 185 Q18 200 28 205 L42 210 L72 145 Z" rx="8" />
      {/* Left fist */}
      <ellipse cx="25" cy="207" rx="14" ry="12" />

      {/* Right arm */}
      <path d="M160 110 L198 185 Q202 200 192 205 L178 210 L148 145 Z" />
      {/* Right fist */}
      <ellipse cx="195" cy="207" rx="14" ry="12" />

      {/* Belt */}
      <rect x="72" y="207" width="76" height="14" rx="4" opacity="0.9" />

      {/* Left leg */}
      <path d="M72 218 L62 360 Q60 378 75 380 L95 380 L108 260 L108 218 Z" rx="6" />
      {/* Left boot */}
      <path d="M62 362 Q58 395 72 400 L98 400 L98 375 Z" />

      {/* Right leg */}
      <path d="M148 218 L158 360 Q160 378 145 380 L125 380 L112 260 L112 218 Z" />
      {/* Right boot */}
      <path d="M158 362 Q162 395 148 400 L122 400 L122 375 Z" />
    </svg>
  );
}

export default function Activation() {
  const { theme, character } = useTheme();
  const [step, setStep] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [silhouetteVisible, setSilhouetteVisible] = useState(false);

  const primary = theme?.primaryColor ?? "#00d4ff";

  useEffect(() => {
    STEPS.forEach((s, i) => {
      setTimeout(() => setStep(i + 1), s.delay + 100);
    });
    setTimeout(() => setSweeping(true), 2800);
    setTimeout(() => setSilhouetteVisible(true), 200);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme?.backgroundColor ?? "#0a0e1a" }}
    >
      {/* ── Hero shadow / silhouette layer ── */}

      {/* Character name watermark — giant rotated text */}
      {character && (
        <div
          className="animate-name-drift pointer-events-none select-none absolute"
          style={{
            bottom: "5%",
            left: "50%",
            fontSize: "clamp(5rem, 18vw, 14rem)",
            fontFamily: "var(--app-font-sans)",
            fontWeight: 900,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: primary,
            whiteSpace: "nowrap",
            lineHeight: 1,
          }}
        >
          {character}
        </div>
      )}

      {/* Hero silhouette glow bloom */}
      <div
        className="animate-hero-glow-pulse pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(55vw, 340px)",
          height: "min(80vh, 560px)",
          background: `radial-gradient(ellipse 60% 80% at 50% 85%, ${primary}44 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Hero figure silhouette */}
      <div
        className="animate-hero-breathe pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: "min(44vw, 280px)",
          height: "min(75vh, 520px)",
          opacity: silhouetteVisible ? undefined : 0,
          filter: `drop-shadow(0 0 24px ${primary}88) drop-shadow(0 0 60px ${primary}44)`,
          transition: "opacity 1.2s ease",
        }}
      >
        <HeroSilhouette color={primary} />
      </div>

      {/* Sweep flash on finish */}
      {sweeping && (
        <div
          className="absolute inset-0 pointer-events-none animate-sweep-flash"
          style={{
            background: `linear-gradient(to right, transparent, ${primary}22, ${primary}55, ${primary}22, transparent)`,
          }}
        />
      )}

      {/* Ambient radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${primary}11 0%, transparent 70%)`,
        }}
      />

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-lg">
        <div className="relative">
          <Shield
            className="w-20 h-20 animate-spin-slow"
            style={{
              color: primary,
              filter: `drop-shadow(0 0 20px ${primary}) drop-shadow(0 0 40px ${primary}88)`,
            }}
          />
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              background: `${primary}22`,
              animationDuration: "1.5s",
            }}
          />
        </div>

        <div className="space-y-2">
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-widest font-sans"
            style={{
              color: primary,
              textShadow: `0 0 20px ${primary}, 0 0 40px ${primary}88`,
            }}
          >
            {theme?.label ?? "ACTIVATING"}
          </h2>
          <p
            className="font-mono text-sm tracking-widest"
            style={{ color: `${primary}99` }}
          >
            {theme?.tagline ?? "Identity confirmed. System online."}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-2.5">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 font-mono text-xs">
              <div
                className="w-2 h-2 rounded-full shrink-0 transition-all duration-300"
                style={{
                  backgroundColor: step > i ? primary : "transparent",
                  border: `1px solid ${primary}66`,
                  boxShadow: step > i ? `0 0 8px ${primary}` : "none",
                }}
              />
              <span
                className="transition-all duration-300"
                style={{
                  color: step > i ? primary : `${primary}44`,
                  textShadow: step > i ? `0 0 6px ${primary}88` : "none",
                }}
              >
                {s.label.toUpperCase()}
              </span>
              {step > i && (
                <span style={{ color: primary }} className="ml-auto">
                  OK
                </span>
              )}
            </div>
          ))}
        </div>

        <div
          className="w-48 h-px overflow-hidden rounded-full"
          style={{ backgroundColor: `${primary}22` }}
        >
          <div
            className="h-full transition-all duration-[400ms] ease-out rounded-full"
            style={{
              width: `${Math.min(100, (step / STEPS.length) * 100)}%`,
              backgroundColor: primary,
              boxShadow: `0 0 10px ${primary}`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
