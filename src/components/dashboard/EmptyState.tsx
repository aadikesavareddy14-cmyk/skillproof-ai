import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 max-w-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="press-scale px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
