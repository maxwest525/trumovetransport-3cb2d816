import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  pulseOffset: number;
}

interface HeroParticlesProps {
  className?: string;
  density?: "subtle" | "normal" | "dramatic";
}

const densitySettings = {
  subtle: { count: 30, opacity: 0.3, lineOpacity: 0.08, connectionDistance: 100 },
  normal: { count: 60, opacity: 0.5, lineOpacity: 0.15, connectionDistance: 140 },
  dramatic: { count: 80, opacity: 0.7, lineOpacity: 0.25, connectionDistance: 180 },
};

export default function HeroParticles({ className = "", density = "dramatic" }: HeroParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const settings = densitySettings[density];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateDimensions = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateDimensions();

    // Initialize particles
    const particleCount = Math.min(settings.count, Math.floor((dimensions.width * dimensions.height) / 12000));
    particlesRef.current = Array.from({ length: particleCount }, () => 
      createParticle(canvas.width, canvas.height, settings.opacity)
    );

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Mouse tracking for interactive effect
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [settings.count, settings.opacity]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reinitialize particles when dimensions change
    const particleCount = Math.min(settings.count, Math.floor((dimensions.width * dimensions.height) / 12000));
    if (particlesRef.current.length !== particleCount) {
      particlesRef.current = Array.from({ length: particleCount }, () => 
        createParticle(dimensions.width, dimensions.height, settings.opacity)
      );
    }

    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;

        // Mouse interaction - particles are attracted/repelled slightly
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - particle.x;
          const dy = mouseRef.current.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 200) {
            const force = (200 - distance) / 200 * 0.02;
            particle.x -= dx * force * 0.5;
            particle.y -= dy * force * 0.5;
          }
        }

        // Wrap around edges
        if (particle.x < -10) particle.x = dimensions.width + 10;
        if (particle.x > dimensions.width + 10) particle.x = -10;
        if (particle.y < -10) particle.y = dimensions.height + 10;
        if (particle.y > dimensions.height + 10) particle.y = -10;

        // Pulsing opacity
        const pulse = Math.sin(time + particle.pulseOffset) * 0.3 + 0.7;
        particle.opacity = particle.baseOpacity * pulse;

        // Fade in/out based on position
        const edgeDistance = Math.min(
          particle.x,
          particle.y,
          dimensions.width - particle.x,
          dimensions.height - particle.y
        );
        const fadeFactor = Math.min(1, edgeDistance / 80);

        // Draw particle as soft glowing dot with multiple layers
        const alpha = particle.opacity * fadeFactor;
        
        // Outer glow
        const outerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        outerGradient.addColorStop(0, `hsla(142, 76%, 55%, ${alpha * 0.3})`);
        outerGradient.addColorStop(0.5, `hsla(142, 76%, 50%, ${alpha * 0.1})`);
        outerGradient.addColorStop(1, `hsla(142, 76%, 45%, 0)`);
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = outerGradient;
        ctx.fill();

        // Inner core
        const innerGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 1.5
        );
        innerGradient.addColorStop(0, `hsla(142, 80%, 65%, ${alpha})`);
        innerGradient.addColorStop(0.6, `hsla(142, 76%, 50%, ${alpha * 0.6})`);
        innerGradient.addColorStop(1, `hsla(142, 76%, 45%, 0)`);

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = innerGradient;
        ctx.fill();

        // Connect nearby particles with gradient lines
        particlesRef.current.slice(index + 1).forEach((other) => {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < settings.connectionDistance) {
            const lineAlpha = (1 - distance / settings.connectionDistance) * settings.lineOpacity * fadeFactor;
            
            // Create gradient line
            const lineGradient = ctx.createLinearGradient(
              particle.x, particle.y, other.x, other.y
            );
            lineGradient.addColorStop(0, `hsla(142, 76%, 55%, ${lineAlpha})`);
            lineGradient.addColorStop(0.5, `hsla(142, 76%, 50%, ${lineAlpha * 0.7})`);
            lineGradient.addColorStop(1, `hsla(142, 76%, 55%, ${lineAlpha})`);
            
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, settings]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ position: 'absolute' }}
      aria-hidden="true"
    />
  );
}

function createParticle(width: number, height: number, maxOpacity: number): Particle {
  const baseOpacity = Math.random() * maxOpacity * 0.6 + maxOpacity * 0.2;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2.5 + 1.5,
    speedX: (Math.random() - 0.5) * 0.4,
    speedY: (Math.random() - 0.5) * 0.4,
    opacity: baseOpacity,
    baseOpacity,
    pulseOffset: Math.random() * Math.PI * 2,
  };
}
