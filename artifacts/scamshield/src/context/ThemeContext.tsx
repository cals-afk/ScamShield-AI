import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CharacterTheme } from "@workspace/api-client-react";

export type AppPhase = "onboarding" | "hero_reveal" | "activating" | "ready";

interface ThemeContextValue {
  phase: AppPhase;
  theme: CharacterTheme | null;
  character: string;
  heroImageUrl: string | null;
  /** Called once theme is ready — always triggers hero_reveal for every character */
  activateTheme: (character: string, theme: CharacterTheme) => void;
  /** Called whenever the background image fetch completes */
  setHeroImage: (url: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  phase: "onboarding",
  theme: null,
  character: "",
  heroImageUrl: null,
  activateTheme: () => {},
  setHeroImage: () => {},
});

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyThemeToCss(theme: CharacterTheme) {
  const root = document.documentElement;
  const primary = hexToHsl(theme.primaryColor);
  const secondary = hexToHsl(theme.secondaryColor);
  const accent = hexToHsl(theme.accentColor);
  const bg = hexToHsl(theme.backgroundColor);
  const fg = hexToHsl(theme.foregroundColor);

  root.style.setProperty("--primary", primary);
  root.style.setProperty("--primary-foreground", bg);
  root.style.setProperty("--background", bg);
  root.style.setProperty("--foreground", fg);
  root.style.setProperty("--card", bg);
  root.style.setProperty("--card-foreground", fg);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--accent-foreground", bg);
  root.style.setProperty("--ring", primary);
  root.style.setProperty("--border", `${hexToHsl(theme.primaryColor).split(" ")[0]} ${hexToHsl(theme.primaryColor).split(" ")[1]} 25%`);
  root.style.setProperty("--muted-foreground", fg);
  root.style.setProperty("--sidebar-primary", primary);
  root.style.setProperty("--sidebar-ring", primary);
  root.style.setProperty("--sidebar-primary-border", primary);
  root.style.setProperty("--theme-primary-hex", theme.primaryColor);
  root.style.setProperty("--theme-secondary-hex", theme.secondaryColor);
  root.style.setProperty("--theme-accent-hex", theme.accentColor);
  root.style.setProperty("--theme-bg-hex", theme.backgroundColor);

  void secondary;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AppPhase>("onboarding");
  const [theme, setTheme] = useState<CharacterTheme | null>(null);
  const [character, setCharacter] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  // Always starts hero_reveal — every character gets the cinematic reveal
  const activateTheme = useCallback((char: string, t: CharacterTheme) => {
    setCharacter(char);
    setTheme(t);
    setHeroImageUrl(null); // image will arrive later via setHeroImage
    applyThemeToCss(t);
    setPhase("hero_reveal");
  }, []);

  // Called from onboarding once the background image fetch completes
  const setHeroImage = useCallback((url: string) => {
    setHeroImageUrl(url);
  }, []);

  useEffect(() => {
    if (phase === "hero_reveal") {
      const timer = setTimeout(() => setPhase("activating"), 5800);
      return () => clearTimeout(timer);
    }
    if (phase === "activating") {
      const timer = setTimeout(() => setPhase("ready"), 3800);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [phase]);

  return (
    <ThemeContext.Provider value={{ phase, theme, character, heroImageUrl, activateTheme, setHeroImage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
