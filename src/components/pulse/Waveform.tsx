import React from 'react';

export const Waveform: React.FC<{ className?: string }> = ({ className = '' }) => {
  const bars = 12;
  return (
    <div className={`flex items-center gap-[2px] h-5 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-[2px] bg-primary rounded-full origin-center"
          style={{
            height: '100%',
            animation: `waveform-bar 1.2s ease-in-out ${i * 0.08}s infinite`,
          }}
        />
      ))}
    </div>
  );
};
