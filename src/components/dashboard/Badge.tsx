interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  children: React.ReactNode;
  size?: 'sm' | 'md';
}

const variants: Record<BadgeProps['variant'], string> = {
  success: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  neutral: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
};

export function Badge({ variant, children, size = 'md' }: BadgeProps) {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${sizeClass} ${variants[variant]}`}>
      {children}
    </span>
  );
}
