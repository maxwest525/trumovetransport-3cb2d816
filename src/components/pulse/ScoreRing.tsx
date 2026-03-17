import React from 'react';

interface ScoreRingProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizes = {
  sm: { dim: 40, stroke: 3, font: 'text-[10px]' },
  md: { dim: 56, stroke: 4, font: 'text-xs' },
  lg: { dim: 88, stroke: 5, font: 'text-lg' },
};

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, maxScore = 100, size = 'md', label, className = '' }) => {
  const { dim, stroke, font } = sizes[size];
  const radius = (dim - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / maxScore, 1);
  const offset = circumference * (1 - pct);
  const color = pct >= 0.8 ? 'stroke-compliance-pass' : pct >= 0.6 ? 'stroke-compliance-review' : 'stroke-compliance-fail';

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <svg width={dim} height={dim} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" strokeWidth={stroke}
          className="stroke-border/40" />
        <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" strokeWidth={stroke}
          className={color}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <span className={`absolute font-semibold font-mono ${font}`}
        style={{ width: dim, height: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginTop: `-${dim + 4}px` }}>
        {Math.round(score)}
      </span>
      {label && <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>}
    </div>
  );
};
