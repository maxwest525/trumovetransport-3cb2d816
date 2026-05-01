import { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  isActive: boolean;
  isSpeaking: boolean;
  className?: string;
}

export default function VoiceWaveform({ isActive, isSpeaking, className = '' }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const barCount = 48;
    const barWidth = 2.5;
    const gap = 1.5;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (!isActive) {
        ctx.fillStyle = `hsla(0, 0%, 0%, 0.25)`;
        const totalW = barCount * (barWidth + gap) - gap;
        const startX = (w - totalW) / 2;
        for (let i = 0; i < barCount; i++) {
          const x = startX + i * (barWidth + gap);
          ctx.beginPath();
          ctx.roundRect(x, h / 2 - 0.5, barWidth, 1, 0.5);
          ctx.fill();
        }
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      phaseRef.current += isSpeaking ? 0.1 : 0.02;
      const totalW = barCount * (barWidth + gap) - gap;
      const startX = (w - totalW) / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const norm = i / (barCount - 1);
        const center = Math.abs(norm - 0.5) * 2;

        let amplitude: number;
        if (isSpeaking) {
          const wave1 = Math.sin(phaseRef.current * 4 + i * 0.5) * 0.6 + 0.5;
          const wave2 = Math.sin(phaseRef.current * 6.7 + i * 0.9) * 0.4 + 0.5;
          const wave3 = Math.sin(phaseRef.current * 2.3 + i * 0.3) * 0.3 + 0.5;
          const wave4 = Math.sin(phaseRef.current * 8.1 + i * 1.2) * 0.2 + 0.5;
          amplitude = (wave1 + wave2 + wave3 + wave4) / 4;
          amplitude *= (1 - center * 0.4); // Less taper = wider active area
          amplitude = Math.max(0.12, amplitude * 1.3); // Boost overall
        } else {
          const wave = Math.sin(phaseRef.current * 2 + i * 0.3) * 0.12 + 0.15;
          amplitude = wave * (1 - center * 0.7);
          amplitude = Math.max(0.04, amplitude);
        }

        const barH = Math.max(2, amplitude * (h * 0.92));
        const y = (h - barH) / 2;

        const alpha = isSpeaking ? 0.6 + amplitude * 0.4 : 0.25 + amplitude * 0.35;
        ctx.fillStyle = `hsla(0, 0%, 0%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1.25);
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, isSpeaking]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: '36px' }}
    />
  );
}
