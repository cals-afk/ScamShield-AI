import { useEffect, useRef } from "react";
import type { CharacterTheme } from "@workspace/api-client-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Props {
  theme: CharacterTheme | null;
  active: boolean;
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

export default function ParticleBackground({ theme, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const color = theme?.primaryColor ?? "#00d4ff";
    const shape = theme?.particleShape ?? "circle";
    const MAX_PARTICLES = active ? 80 : 30;

    function spawnParticle(): Particle {
      return {
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * (active ? 1.5 : 0.4),
        vy: (Math.random() - 0.5) * (active ? 1.5 : 0.4) - (active ? 0.3 : 0.1),
        size: Math.random() * (active ? 4 : 2) + 1,
        opacity: Math.random() * 0.6 + 0.1,
        life: 0,
        maxLife: Math.random() * 300 + 150,
      };
    }

    while (particles.current.length < MAX_PARTICLES) {
      const p = spawnParticle();
      p.life = Math.random() * p.maxLife;
      particles.current.push(p);
    }

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const isActive = activeRef.current;

      if (particles.current.length < (isActive ? 80 : 30)) {
        particles.current.push(spawnParticle());
      }

      particles.current = particles.current.filter((p) => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;

        const lifeFrac = p.life / p.maxLife;
        const fadeIn = Math.min(1, lifeFrac * 5);
        const fadeOut = 1 - Math.max(0, (lifeFrac - 0.7) / 0.3);
        const alpha = p.opacity * fadeIn * fadeOut;

        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = color;
        ctx!.shadowColor = color;
        ctx!.shadowBlur = isActive ? 12 : 4;

        drawShape(ctx!, shape, p.x, p.y, p.size);
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.globalAlpha = 1;

        return p.life < p.maxLife;
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [theme, active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity: active ? 1 : 0.4 }}
    />
  );
}
