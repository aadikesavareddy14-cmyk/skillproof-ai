import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', hover = true, gradient = false }: CardProps) {
  return (
    <div
      className={`relative rounded-2xl border border-zinc-800 bg-zinc-900/40 ${
        hover ? 'card-hover' : ''
      } ${gradient ? 'gradient-overlay' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
