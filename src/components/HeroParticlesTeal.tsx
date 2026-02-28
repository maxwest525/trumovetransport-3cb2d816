import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; size: number;
  speedX: number; speedY: number;
  opacity: number; baseOpacity: number; pulseOffset: number;
}

export default function HeroParticlesTeal({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const p = canvas.parentElement;
      if (!p) return;
      const r = p.getBoundingClientRect();
      canvas.width = r.width;
      canvas.height = r.height;
    };

    resize();
    const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      opacity: 0,
      baseOpacity: Math.random() * 0.4 + 0.15,
      pulseOffset: Math.random() * Math.PI * 2,
    }));

    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top, active: true };
    };
    const onLeave = () => { mouseRef.current.active = false; };
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    let t = 0;
    const draw = () => {
      t += 0.008;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p, i) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x, dy = mouseRef.current.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 180) {
            const f = (180 - d) / 180 * 0.015;
            p.x -= dx * f;
            p.y -= dy * f;
          }
        }

        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        const pulse = Math.sin(t + p.pulseOffset) * 0.3 + 0.7;
        p.opacity = p.baseOpacity * pulse;
        const edge = Math.min(p.x, p.y, w - p.x, h - p.y);
        const fade = Math.min(1, edge / 60);
        const a = p.opacity * fade;

        // Outer glow
        const og = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        og.addColorStop(0, `hsla(175, 70%, 55%, ${a * 0.25})`);
        og.addColorStop(0.5, `hsla(175, 70%, 45%, ${a * 0.08})`);
        og.addColorStop(1, `hsla(175, 70%, 40%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = og;
        ctx.fill();

        // Core
        const ig = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 1.5);
        ig.addColorStop(0, `hsla(175, 80%, 65%, ${a})`);
        ig.addColorStop(0.6, `hsla(175, 70%, 50%, ${a * 0.5})`);
        ig.addColorStop(1, `hsla(175, 70%, 40%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = ig;
        ctx.fill();

        // Lines
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const o = particlesRef.current[j];
          const dx = o.x - p.x, dy = o.y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 140) {
            const la = (1 - d / 140) * 0.12 * fade;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = `hsla(175, 70%, 50%, ${la})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      ro.disconnect();
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 pointer-events-auto ${className}`} aria-hidden="true" />;
}
