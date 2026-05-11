import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Shield } from "lucide-react";
import type { CharacterTheme } from "@workspace/api-client-react/src/generated/api.schemas";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchTheme(character: string): Promise<CharacterTheme> {
  const res = await fetch(`${BASE}/api/theme/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ character }),
  });
  if (!res.ok) throw new Error("Theme generation failed");
  return res.json() as Promise<CharacterTheme>;
}

async function fetchHeroImage(character: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${BASE}/api/hero/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ character }),
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { imageUrl?: string };
    return data.imageUrl;
  } catch {
    return undefined;
  }
}

export default function Onboarding() {
  const [character, setCharacter] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { activateTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => setShowCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async () => {
    const trimmed = character.trim();
    if (!trimmed || isPending) return;

    setIsPending(true);
    setIsError(false);

    try {
      const [theme, heroImageUrl] = await Promise.all([
        fetchTheme(trimmed),
        fetchHeroImage(trimmed),
      ]);
      activateTheme(trimmed, theme, heroImageUrl);
    } catch {
      setIsError(true);
      setIsPending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSubmit();
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,212,255,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-xl w-full text-center">
        <div className="flex items-center gap-4 mb-2">
          <Shield className="neon-shield w-10 h-10 shrink-0" />
          <span className="neon-title text-2xl font-extrabold tracking-widest">
            SCAMSHIELD AI
          </span>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />

        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em] animate-in fade-in duration-1000 delay-300">
            Identity Protocol — v2.1
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-mono text-foreground leading-tight">
            Who is your favorite
            <br />
            <span className="text-primary">
              character or hero
              <span
                className="ml-1 inline-block w-0.5 h-7 bg-primary align-bottom"
                style={{ opacity: showCursor ? 1 : 0, transition: "opacity 0.1s" }}
              />
            </span>
            ?
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            ScamShield will adapt its interface to match your hero's signature.
          </p>
        </div>

        <div
          className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700"
          style={{ animationDelay: "400ms" }}
        >
          <div className="relative group">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-500" />
            <input
              ref={inputRef}
              data-testid="input-character"
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              onKeyDown={handleKey}
              disabled={isPending}
              placeholder="e.g. Iron Man, Batman, Hermione..."
              className="relative w-full bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono text-base text-center tracking-wide disabled:opacity-50"
            />
          </div>

          <button
            data-testid="button-activate"
            onClick={() => void handleSubmit()}
            disabled={!character.trim() || isPending}
            className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-primary-foreground bg-primary border border-primary/40 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,212,255,0.35)] hover:shadow-[0_0_45px_rgba(0,212,255,0.7)] hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            {isPending ? (
              <span className="relative flex items-center gap-2 font-mono text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                </span>
                Summoning your hero...
              </span>
            ) : (
              <span className="relative flex items-center gap-2">
                <Shield className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                Activate Protocol
              </span>
            )}
          </button>
        </div>

        {isError && (
          <p className="text-sm font-mono text-destructive animate-in fade-in duration-300">
            Protocol failed. Please try again.
          </p>
        )}

        <p className="text-xs text-muted-foreground/40 font-mono tracking-widest">
          SYSTEM READY · AWAITING INPUT
        </p>
      </div>
    </div>
  );
}
