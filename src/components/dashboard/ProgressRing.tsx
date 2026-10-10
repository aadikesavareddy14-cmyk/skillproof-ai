import { useEffect, useState } from 'react';

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
  colorScheme?: 'auto' | 'success' | 'warning' | 'error' | 'info';
  startColor?: string;
  stopColor?: string;
}

export function ProgressRing({
  value,
  size = 120,
  strokeWidth = 8,
  label,
  sublabel,
  gradientId = 'ring-gradient',
  colorScheme = 'auto',
  startColor,
  stopColor,
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

  // Determine gradient colors based on value or explicit scheme
  let resolvedStart = startColor;
  let resolvedStop = stopColor;

  if (!resolvedStart || !resolvedStop) {
    if (colorScheme === 'success' || (colorScheme === 'auto' && clampedValue >= 91)) {
      resolvedStart = '#10b981'; // Emerald
      resolvedStop = '#059669';
    } else if (colorScheme === 'info' || (colorScheme === 'auto' && clampedValue >= 76)) {
      resolvedStart = '#3b82f6'; // Blue
      resolvedStop = '#14b8a6'; // Teal
    } else if (colorScheme === 'warning' || (colorScheme === 'auto' && clampedValue >= 61)) {
      resolvedStart = '#f59e0b'; // Amber
      resolvedStop = '#eab308';
    } else if (colorScheme === 'auto' && clampedValue >= 41) {
      resolvedStart = '#f97316'; // Orange
      resolvedStop = '#f59e0b';
    } else {
      resolvedStart = '#ef4444'; // Red
      resolvedStop = '#dc2626';
    }
  }

  const uniqueId = `${gradientId}-${Math.round(clampedValue)}-${size}`;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={uniqueId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={resolvedStart} />
            <stop offset="100%" stopColor={resolvedStop} />
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
          stroke={`url(#${uniqueId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="ring-progress transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {label && (
          <span className="text-3xl font-bold tabular-nums text-white tracking-tight">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="text-xs text-zinc-400 font-medium mt-0.5">{sublabel}</span>
        )}
      </div>
    </div>
  );
}
