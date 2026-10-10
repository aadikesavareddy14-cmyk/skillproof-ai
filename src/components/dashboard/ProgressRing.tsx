import { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  gradientId = 'ring-gradient',
}: ProgressRingProps) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (clampedValue / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [clampedValue, circumference]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="ring-progress"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {label && (
          <span className="text-2xl font-bold tabular-nums text-white">{label}</span>
        )}
        {sublabel && (
          <span className="text-xs text-zinc-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
