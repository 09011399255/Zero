import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
}

// Centered "something went wrong + Try again" block shown in place of a page's
// content when its data fetch fails. Mirrors the visual language of the empty
// states already used across the feature pages.
export function ErrorState({ message, onRetry, retrying }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 bg-status-dangerBg text-status-danger rounded-full flex items-center justify-center mb-4">
        <AlertTriangle size={22} />
      </div>
      <p className="text-sm font-semibold text-text-primary">Something went wrong</p>
      <p className="text-xs text-text-secondary mt-1 max-w-xs">
        {message || "We couldn't load this data. Please try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        disabled={retrying}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white font-semibold rounded-xl text-xs transition duration-150"
      >
        <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
        <span>{retrying ? 'Retrying…' : 'Try again'}</span>
      </button>
    </div>
  );
}
