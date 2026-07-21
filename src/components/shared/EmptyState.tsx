import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
  // 'brand' = welcoming (nothing here yet), 'muted' = neutral (no results).
  tone?: 'brand' | 'muted';
}

// Shared, friendly empty-state block. Now that the app shows real data, a
// brand-new clinic legitimately sees empty lists — these should feel like a
// clean starting point, not a failed search.
export function EmptyState({ icon: Icon, title, message, action, tone = 'brand' }: EmptyStateProps) {
  const iconClasses =
    tone === 'brand'
      ? 'bg-brand-50 text-brand-500 border-brand-100'
      : 'bg-surface-subtle text-text-secondary border-surface-border/50';
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${iconClasses}`}>
        <Icon size={24} />
      </div>
      <p className="text-sm font-semibold text-text-primary">{title}</p>
      <p className="text-xs text-text-secondary mt-1.5 max-w-xs leading-relaxed">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-xs transition duration-150 shadow-sm"
        >
          <Plus size={14} />
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
}
