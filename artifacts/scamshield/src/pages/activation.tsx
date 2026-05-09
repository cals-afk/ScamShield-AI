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

export default function Activation() {
  const { theme } = useTheme();
  const [step, setStep] = useState(0);
  const [sweeping, setSweeping] = useState(false);

  const primary = theme?.primaryColor ?? "#00d4ff";

  useEffect(() => {
    STEPS.forEach((s, i) => {
      setTimeout(() => setStep(i + 1), s.delay + 100);
    });
    setTimeout(() => setSweeping(true), 2800);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: theme?.backgroundColor ?? "#0a0e1a" }}
    >
      {sweeping && (
        <div
          className="absolute inset-0 pointer-events-none animate-sweep-flash"
          style={{
            background: `linear-gradient(to right, transparent, ${primary}22, ${primary}55, ${primary}22, transparent)`,
          }}
        />
      )}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${primary}11 0%, transparent 70%)`,
        }}
      />

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
