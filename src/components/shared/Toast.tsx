import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Consumed anywhere below <ToastProvider> (mounted in main.tsx) to fire a
// toast: const toast = useToast(); toast.success('Saved').
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

const TOAST_DURATION = 4000;

const STYLES: Record<ToastType, { bg: string; border: string; text: string; Icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-status-successBg', border: 'border-status-success/20', text: 'text-status-success', Icon: CheckCircle2 },
  error: { bg: 'bg-status-dangerBg', border: 'border-status-danger/20', text: 'text-status-danger', Icon: AlertTriangle },
  info: { bg: 'bg-brand-50', border: 'border-brand-100', text: 'text-brand-600', Icon: Info },
};

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { bg, border, text, Icon } = STYLES[toast.type];
  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-toast-in flex items-start gap-3 p-3.5 rounded-xl border shadow-soft-md bg-surface-base ${border}`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${bg} ${text}`}>
        <Icon size={16} />
      </div>
      <p className="flex-1 text-xs font-medium text-text-primary leading-relaxed pt-0.5">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="text-text-muted hover:text-text-primary transition duration-150 flex-shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => remove(id), TOAST_DURATION);
    },
    [remove]
  );

  const value: ToastContextValue = {
    success: (m) => push('success', m),
    error: (m) => push('error', m),
    info: (m) => push('info', m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            {toasts.map((t) => (
              <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
            ))}
          </div>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
