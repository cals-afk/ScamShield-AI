import type { CharacterTheme } from "@workspace/api-client-react";
import {
  Eye,
  BookOpen,
  Zap,
  Flame,
  Cpu,
  Ghost,
  Shield,
  Layers,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface SentinelMode {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  theme: CharacterTheme;
  /**
   * Short abstract image prompt — describes atmosphere and visual mood only.
   * Deliberately avoids any words that trigger content moderation:
   * no weapons, violence, conflict, named figures, or real-world references.
   */
  imagePrompt: string;
}

export const SENTINEL_MODES: SentinelMode[] = [
  {
    id: "shadow",
    name: "Shadow Sentinel",
    description: "Silence is the deadliest weapon.",
    icon: Eye,
    imagePrompt:
      "A lone silhouetted figure standing still in a swirling violet neon mist, deep purple atmospheric glow, dramatic rim lighting, futuristic dark environment",
    theme: {
      primaryColor: "#8b5cf6",
      secondaryColor: "#4c1d95",
      accentColor: "#a78bfa",
      backgroundColor: "#08041a",
      foregroundColor: "#ede9fe",
      label: "SHADOW MODE",
      tagline: "From darkness, order.",
      particleShape: "hex",
    },
  },
  {
    id: "arcane",
    name: "Arcane Scholar",
    description: "Knowledge dismantles every deception.",
    icon: BookOpen,
    imagePrompt:
      "A robed scholarly silhouette surrounded by floating glowing cyan geometric rune circles, electric teal energy halos, mystical digital atmosphere, deep dark background",
    theme: {
      primaryColor: "#00d4ff",
      secondaryColor: "#0e7490",
      accentColor: "#67e8f9",
      backgroundColor: "#03101a",
      foregroundColor: "#cffafe",
      label: "ARCANE MODE",
      tagline: "Knowledge is the supreme weapon.",
      particleShape: "diamond",
    },
  },
  {
    id: "storm",
    name: "Storm Protocol",
    description: "Strike fast. Leave no footprint.",
    icon: Zap,
    imagePrompt:
      "A commanding silhouette enveloped in electric blue energy arcs and crackling lightning fields, blue neon atmospheric glow, futuristic sci-fi setting, dramatic volumetric light",
    theme: {
      primaryColor: "#3b82f6",
      secondaryColor: "#1d4ed8",
      accentColor: "#93c5fd",
      backgroundColor: "#030b1a",
      foregroundColor: "#dbeafe",
      label: "STORM PROTOCOL",
      tagline: "Strike without warning. Leave no trace.",
      particleShape: "triangle",
    },
  },
  {
    id: "inferno",
    name: "Inferno Core",
    description: "Forged in fire. Impossible to break.",
    icon: Flame,
    imagePrompt:
      "A powerful silhouette surrounded by swirling crimson and deep orange energy fields and luminous ember particles, intense red neon glow, cinematic dark atmosphere",
    theme: {
      primaryColor: "#ef4444",
      secondaryColor: "#b91c1c",
      accentColor: "#fca5a5",
      backgroundColor: "#160303",
      foregroundColor: "#fee2e2",
      label: "INFERNO CORE",
      tagline: "Forged in fire. Unbreakable.",
      particleShape: "star",
    },
  },
  {
    id: "quantum",
    name: "Quantum Guardian",
    description: "Every outcome calculated. Every threat neutralised.",
    icon: Cpu,
    imagePrompt:
      "A still silhouette inside a glowing emerald digital grid matrix, binary code streams, green neon light trails, analytical cold futuristic environment, deep black background",
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#065f46",
      accentColor: "#6ee7b7",
      backgroundColor: "#020e08",
      foregroundColor: "#d1fae5",
      label: "QUANTUM MODE",
      tagline: "Calculating. Precise. Inevitable.",
      particleShape: "hex",
    },
  },
  {
    id: "phantom",
    name: "Phantom Mode",
    description: "Unseen. Undetected. Unstoppable.",
    icon: Ghost,
    imagePrompt:
      "A translucent ghostly silhouette dissolving into swirling fuchsia neon mist and luminous magenta smoke, ethereal spectral glow, deep dark background, otherworldly atmosphere",
    theme: {
      primaryColor: "#e879f9",
      secondaryColor: "#86198f",
      accentColor: "#f5d0fe",
      backgroundColor: "#110516",
      foregroundColor: "#fae8ff",
      label: "PHANTOM MODE",
      tagline: "Unseen. Undetected. Unstoppable.",
      particleShape: "circle",
    },
  },
  {
    id: "vanguard",
    name: "Cyber Vanguard",
    description: "First line of defence. Last line of hope.",
    icon: Shield,
    imagePrompt:
      "A silhouette standing before a large glowing sky-blue energy shield barrier, electric cyan light radiating outward, protective forcefield visual effect, dark futuristic scene",
    theme: {
      primaryColor: "#38bdf8",
      secondaryColor: "#0369a1",
      accentColor: "#bae6fd",
      backgroundColor: "#020c14",
      foregroundColor: "#e0f2fe",
      label: "VANGUARD MODE",
      tagline: "First line. Last resort.",
      particleShape: "triangle",
    },
  },
  {
    id: "titan",
    name: "Titan Protocol",
    description: "Immovable. Indomitable. Absolute.",
    icon: Layers,
    imagePrompt:
      "A massive imposing silhouette radiating golden amber energy pulses, warm amber and gold light emanating from within the figure, enormous scale, cinematic dark void background",
    theme: {
      primaryColor: "#f59e0b",
      secondaryColor: "#b45309",
      accentColor: "#fcd34d",
      backgroundColor: "#150900",
      foregroundColor: "#fef3c7",
      label: "TITAN PROTOCOL",
      tagline: "Immovable. Indomitable. Absolute.",
      particleShape: "diamond",
    },
  },
  {
    id: "maruti",
    name: "Maruti Guard",
    description: "Swift as thought. Silent as code.",
    icon: Wind,
    imagePrompt:
      "A swift silhouette surrounded by trailing lime-green light streaks and glowing speed lines, bright neon green energy motion blur, dynamic futuristic dark environment",
    theme: {
      primaryColor: "#84cc16",
      secondaryColor: "#3f6212",
      accentColor: "#bef264",
      backgroundColor: "#060e02",
      foregroundColor: "#ecfccb",
      label: "MARUTI GUARD",
      tagline: "Swift as thought. Silent as code.",
      particleShape: "hex",
    },
  },
];
