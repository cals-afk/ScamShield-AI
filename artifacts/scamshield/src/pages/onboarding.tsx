import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Shield } from "lucide-react";
import type { CharacterTheme } from "@workspace/api-client-react";

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

async function fetchHeroImage(
  character: string,
  theme: CharacterTheme,
): Promise<string | undefined> {
  try {
    const res = await fetch(`${BASE}/api/hero/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character,
        primaryColor: theme.primaryColor,
        backgroundColor: theme.backgroundColor,
      }),
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
  const [exiting, setExiting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { activateTheme, setHeroImage } = useTheme();

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
      // Wait only for the theme — hero_reveal starts immediately for every character
      const theme = await fetchTheme(trimmed);

      // Trigger exit animation, then transition to hero_reveal
      setExiting(true);
      await new Promise((r) => setTimeout(r, 400));
      activateTheme(trimmed, theme);

      // Image fetch continues in the background — no await here.
      // When it resolves, setHeroImage updates the context and the
      // hero-reveal page fades the photo in over the silhouette.
      void fetchHeroImage(trimmed, theme).then((url) => {
        if (url) setHeroImage(url);
      });
    } catch {
      setIsError(true);
      setIsPending(false);
      setExiting(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleSubmit();
  };

  return (
    <div
      className={`relative min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background overflow-hidden transition-all duration-500 ${
        exiting ? "animate-page-exit" : "animate-page-enter"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,212,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,212,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,212,255,0.06)_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-10 px-6 max-w-xl w-full text-center">
        {/* Logo */}
        <div className="flex items-center gap-4 mb-2 animate-slide-left-in delay-0">
          <Shield className="neon-shield w-10 h-10 shrink-0" />
          <span className="neon-title text-2xl font-extrabold tracking-widest">
            SENTINEL AI
          </span>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-40 animate-rise-in delay-100" />

        {/* Title block */}
        <div className="space-y-3 animate-rise-in delay-200">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.3em]">
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
            Sentinel will adapt its interface to match your hero's signature.
          </p>
        </div>

        {/* Input + button */}
        <div className="w-full space-y-4">
          <div className="relative group animate-rise-in delay-350">
            <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40 opacity-0 group-focus-within:opacity-100 blur-sm transition-all duration-700" />
            <div
              className="absolute -inset-0.5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700"
              style={{ boxShadow: "0 0 24px rgba(0,212,255,0.25)" }}
            />
            <input
              ref={inputRef}
              data-testid="input-character"
              type="text"
              value={character}
              onChange={(e) => setCharacter(e.target.value)}
              onKeyDown={handleKey}
              disabled={isPending}
              placeholder="e.g. Iron Man, Batman, Hermione..."
              className="relative w-full bg-card border border-border rounded-xl px-5 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-400 font-mono text-base text-center tracking-wide disabled:opacity-50"
            />
          </div>

          <button
            data-testid="button-activate"
            onClick={() => void handleSubmit()}
            disabled={!character.trim() || isPending}
            className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold uppercase tracking-widest text-primary-foreground bg-primary border border-primary/40 transition-all duration-400 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden animate-rise-in delay-450"
            style={{
              boxShadow: isPending
                ? "0 0 35px rgba(0,212,255,0.5)"
                : "0 0 20px rgba(0,212,255,0.35)",
              transition: "box-shadow 0.4s ease, transform 0.2s ease, opacity 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!isPending)
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 0 50px rgba(0,212,255,0.75), 0 0 90px rgba(0,212,255,0.3)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 0 20px rgba(0,212,255,0.35)";
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            {isPending ? (
              <span className="relative flex items-center gap-2 font-mono text-sm">
                <span className="inline-flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
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
          <p className="text-sm font-mono text-destructive animate-rise-in">
            Protocol failed. Please try again.
          </p>
        )}

        <p className="text-xs text-muted-foreground/40 font-mono tracking-widest animate-rise-in delay-600">
          SYSTEM READY · AWAITING INPUT
        </p>
      </div>
    </div>
  );
}
