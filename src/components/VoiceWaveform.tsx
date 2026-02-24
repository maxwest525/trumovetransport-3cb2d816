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

    const barCount = 28;
    const barWidth = 2;
    const gap = 1.5;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      if (!isActive) {
        // Idle: flat thin line
        ctx.fillStyle = `hsla(142, 71%, 45%, 0.15)`;
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

      phaseRef.current += isSpeaking ? 0.08 : 0.02;
      const totalW = barCount * (barWidth + gap) - gap;
      const startX = (w - totalW) / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const norm = i / (barCount - 1);
        const center = Math.abs(norm - 0.5) * 2; // 0 at center, 1 at edges

        let amplitude: number;
        if (isSpeaking) {
          // Dynamic bars with multiple wave frequencies
          const wave1 = Math.sin(phaseRef.current * 3 + i * 0.4) * 0.5 + 0.5;
          const wave2 = Math.sin(phaseRef.current * 5.3 + i * 0.7) * 0.3 + 0.5;
          const wave3 = Math.sin(phaseRef.current * 1.7 + i * 0.2) * 0.2 + 0.5;
          amplitude = (wave1 + wave2 + wave3) / 3;
          amplitude *= (1 - center * 0.6); // Taper at edges
          amplitude = Math.max(0.08, amplitude);
        } else {
          // Gentle breathing when listening
          const wave = Math.sin(phaseRef.current * 2 + i * 0.3) * 0.15 + 0.2;
          amplitude = wave * (1 - center * 0.7);
          amplitude = Math.max(0.05, amplitude);
        }

        const barH = Math.max(1.5, amplitude * (h * 0.8));
        const y = (h - barH) / 2;

        // Gradient color based on amplitude
        const alpha = isSpeaking ? 0.4 + amplitude * 0.6 : 0.2 + amplitude * 0.3;
        ctx.fillStyle = `hsla(142, 71%, 45%, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 1);
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
      style={{ height: '24px' }}
    />
  );
}
