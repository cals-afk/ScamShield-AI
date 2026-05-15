import { useEffect, useRef } from "react";
import type { CharacterTheme } from "@workspace/api-client-react";

type Phase = "splash" | "onboarding" | "hero_reveal" | "activating" | "ready";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulseCountdown: number;
  pulseFrame: number;
}

interface Props {
  theme: CharacterTheme | null;
  phase: Phase;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: string,
  x: number,
  y: number,
  size: number,
) {
  ctx.beginPath();
  switch (shape) {
    case "triangle": {
      const h = size * Math.sqrt(3);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + h / 2, y + size / 2);
      ctx.lineTo(x - h / 2, y + size / 2);
      ctx.closePath();
      break;
    }
    case "diamond":
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size * 0.6, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size * 0.6, y);
      ctx.closePath();
      break;
    case "hex": {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        if (i === 0) ctx.moveTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
        else ctx.lineTo(x + size * Math.cos(angle), y + size * Math.sin(angle));
      }
      ctx.closePath();
      break;
    }
    case "star": {
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.4;
        if (i === 0) ctx.moveTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
        else ctx.lineTo(x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath();
      break;
    }
    default:
      ctx.arc(x, y, size, 0, Math.PI * 2);
  }
}

function getPhaseConfig(phase: Phase) {
  switch (phase) {
    case "activating":
      return { count: 68, speed: 1.2, opacity: 1.0, connectionDist: 130, connectionOpacity: 0.22 };
    case "hero_reveal":
      return { count: 32, speed: 0.55, opacity: 0.75, connectionDist: 100, connectionOpacity: 0.14 };
    case "onboarding":
    case "ready":
    default:
      return { count: 44, speed: 0.38, opacity: 0.65, connectionDist: 115, connectionOpacity: 0.17 };
  }
}

const PULSE_DURATION = 50;
const PULSE_INTERVAL_MIN = 90;
const PULSE_INTERVAL_RANGE = 240;

export default function ParticleBackground({ theme, phase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ phase, theme });
  const resizeTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    stateRef.current = { phase, theme };
  }, [phase, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true, desynchronized: true });
    if (!ctx) return;

    // Detect if device is low-performance (mobile or reduced motion preference)
    const isLowPerformance = window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
                             /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const resize = () => {
      // Debounce resize for better performance
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);
      }, 150);
    };
    resize();
    window.addEventListener("resize", resize);

    let particles: Particle[] = [];

    function spawnParticle(w: number, h: number, speed: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed * 2,
        vy: (Math.random() - 0.5) * speed * 2,
        size: Math.random() * 1.4 + 0.7,
        opacity: Math.random() * 0.38 + 0.12,
        pulseCountdown: Math.floor(Math.random() * PULSE_INTERVAL_RANGE + PULSE_INTERVAL_MIN),
        pulseFrame: -1,
      };
    }

    const cfg = getPhaseConfig(stateRef.current.phase);
    // Reduce particle count on low-performance devices
    const particleCount = isLowPerformance ? Math.floor(cfg.count * 0.6) : cfg.count;
    
    for (let i = 0; i < particleCount; i++) {
      const p = spawnParticle(window.innerWidth, window.innerHeight, cfg.speed);
      particles.push(p);
    }

    let animRef = 0;
    let lastTime = performance.now();
    const targetFPS = isLowPerformance ? 30 : 60;
    const frameInterval = 1000 / targetFPS;

    function animate(currentTime: number) {
      const deltaTime = currentTime - lastTime;
      
      // Throttle frame rate on low-performance devices
      if (deltaTime < frameInterval) {
        animRef = requestAnimationFrame(animate);
        return;
      }
      
      lastTime = currentTime - (deltaTime % frameInterval);

      const { phase: curPhase, theme: curTheme } = stateRef.current;
      const config = getPhaseConfig(curPhase);
      const color = curTheme?.primaryColor ?? "#00d4ff";
      const shape = curTheme?.particleShape ?? "circle";
      const [r, g, b] = hexToRgb(color);

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx!.clearRect(0, 0, w, h);

      /* ── Reconcile particle count ── */
      const targetCount = isLowPerformance ? Math.floor(config.count * 0.6) : config.count;
      while (particles.length < targetCount) {
        particles.push(spawnParticle(w, h, config.speed));
      }
      if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }

      /* ── Update positions ── */
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        if (p.pulseFrame >= 0) {
          p.pulseFrame++;
          if (p.pulseFrame >= PULSE_DURATION) p.pulseFrame = -1;
        }
        p.pulseCountdown--;
        if (p.pulseCountdown <= 0) {
          p.pulseFrame = 0;
          p.pulseCountdown = Math.floor(Math.random() * PULSE_INTERVAL_RANGE + PULSE_INTERVAL_MIN);
        }
      }

      /* ── Draw connection lines (optimized) ── */
      ctx!.lineWidth = 0.6;
      const maxDist = config.connectionDist;
      const maxDistSq = maxDist * maxDist; // Use squared distance to avoid sqrt
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          if (Math.abs(dx) > maxDist) continue;
          const dy = particles[i].y - particles[j].y;
          if (Math.abs(dy) > maxDist) continue;
          
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const dist = Math.sqrt(distSq);
            const lineAlpha = (1 - dist / maxDist) * config.connectionOpacity;
            ctx!.strokeStyle = `rgba(${r},${g},${b},${lineAlpha.toFixed(3)})`;
            ctx!.beginPath();
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }

      /* ── Draw regular particles (batch by shadow blur) ── */
      ctx!.shadowBlur = 5;
      ctx!.shadowColor = color;
      for (const p of particles) {
        if (p.pulseFrame >= 0) continue;
        ctx!.globalAlpha = p.opacity;
        ctx!.fillStyle = color;
        drawShape(ctx!, shape, p.x, p.y, p.size);
        ctx!.fill();
      }

      /* ── Draw pulsing particles on top ── */
      ctx!.shadowBlur = 20;
      for (const p of particles) {
        if (p.pulseFrame < 0) continue;
        const t = p.pulseFrame / PULSE_DURATION;
        const pulse = Math.sin(t * Math.PI);
        ctx!.globalAlpha = p.opacity + pulse * 0.55;
        ctx!.fillStyle = color;
        drawShape(ctx!, shape, p.x, p.y, p.size + pulse * p.size * 2.8);
        ctx!.fill();
      }

      ctx!.shadowBlur = 0;
      ctx!.globalAlpha = 1;

      animRef = requestAnimationFrame(animate);
    }

    animRef = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      cancelAnimationFrame(animRef);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        opacity: stateRef.current.phase === "activating" ? 1
          : stateRef.current.phase === "hero_reveal" ? 0.7
          : 0.6,
      }}
    />
  );
}
