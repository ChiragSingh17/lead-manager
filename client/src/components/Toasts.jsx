import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function Toasts({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = toast.tone === 'error' ? AlertCircle : CheckCircle2;
        return (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <Icon size={19} />
            <span>{toast.message}</span>
            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
