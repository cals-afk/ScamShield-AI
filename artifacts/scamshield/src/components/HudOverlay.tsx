import { useTheme } from "@/context/ThemeContext";

function CornerBracket({
  pos,
  color,
}: {
  pos: "tl" | "tr" | "bl" | "br";
  color: string;
}) {
  const SIZE = 18;
  const BW = "1.5px";
  const base: React.CSSProperties = {
    position: "absolute",
    width: SIZE,
    height: SIZE,
  };
  const style: React.CSSProperties =
    pos === "tl"
      ? { ...base, top: 18, left: 18, borderTop: `${BW} solid ${color}`, borderLeft: `${BW} solid ${color}` }
      : pos === "tr"
      ? { ...base, top: 18, right: 18, borderTop: `${BW} solid ${color}`, borderRight: `${BW} solid ${color}` }
      : pos === "bl"
      ? { ...base, bottom: 18, left: 18, borderBottom: `${BW} solid ${color}`, borderLeft: `${BW} solid ${color}` }
      : { ...base, bottom: 18, right: 18, borderBottom: `${BW} solid ${color}`, borderRight: `${BW} solid ${color}` };

  return <div className="animate-hud-corner-breathe" style={style} />;
}

export default function HudOverlay() {
  const { theme } = useTheme();
  const primary = theme?.primaryColor ?? "#00d4ff";

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[2] overflow-hidden"
      style={{ opacity: 0.38 }}
    >
      {/* Corner brackets */}
      <CornerBracket pos="tl" color={primary} />
      <CornerBracket pos="tr" color={primary} />
      <CornerBracket pos="bl" color={primary} />
      <CornerBracket pos="br" color={primary} />

      {/* Periodic horizontal scan line — sweeps top → bottom every 10s */}
      <div
        className="absolute left-0 right-0 h-px animate-hud-scan-v"
        style={{
          background: `linear-gradient(to right, transparent 0%, ${primary}22 15%, ${primary}77 50%, ${primary}22 85%, transparent 100%)`,
          boxShadow: `0 0 8px ${primary}55`,
        }}
      />

      {/* Top-center: status label */}
      <div
        className="absolute top-[18px] left-1/2 -translate-x-1/2 flex items-center gap-2"
        style={{ opacity: 0.6 }}
      >
        <div
          className="w-1 h-1 rounded-full animate-hud-blink"
          style={{ backgroundColor: primary }}
        />
        <span
          className="font-mono text-[8px] tracking-[0.35em] uppercase"
          style={{ color: primary }}
        >
          Threat Monitor
        </span>
        <div
          className="w-1 h-1 rounded-full animate-hud-blink"
          style={{ backgroundColor: primary, animationDelay: "0.6s" }}
        />
      </div>

      {/* Bottom-center: grid status */}
      <div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3"
        style={{ opacity: 0.5 }}
      >
        <div
          className="w-1 h-1 rounded-full animate-hud-blink"
          style={{ backgroundColor: primary, animationDelay: "0.3s" }}
        />
        <span
          className="font-mono text-[8px] tracking-[0.3em] uppercase"
          style={{ color: primary }}
        >
          Sentinel Grid Online
        </span>
        <div
          className="w-1 h-1 rounded-full animate-hud-blink"
          style={{ backgroundColor: primary, animationDelay: "0.9s" }}
        />
      </div>

      {/* Left edge: vertical label — hidden on very small phones */}
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:block"
        style={{ opacity: 0.28 }}
      >
        <span
          className="font-mono text-[7px] tracking-[0.3em] uppercase"
          style={{
            color: primary,
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          {theme?.label ?? "Sentinel AI"}
        </span>
      </div>

      {/* Right edge: vertical label — hidden on very small phones */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:block"
        style={{ opacity: 0.28 }}
      >
        <span
          className="font-mono text-[7px] tracking-[0.3em] uppercase"
          style={{
            color: primary,
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
          }}
        >
          v3.0 · Shield Active
        </span>
      </div>
    </div>
  );
}
