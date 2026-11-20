import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { getApiError } from '../utils/validation.js';

export default function ConfirmDialog({ lead, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !busy) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, busy]);

  async function handleConfirm() {
    setBusy(true);
    setError('');
    try {
      await onConfirm();
    } catch (requestError) {
      setError(getApiError(requestError, 'Could not delete this lead. Please try again.'));
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <button type="button" className="icon-button modal-close confirm-close" onClick={onClose} disabled={busy}>
          <X size={18} />
          <span className="sr-only">Close</span>
        </button>

        <div className="confirm-icon">
          <AlertTriangle size={24} />
        </div>
        <h2 id="confirm-title">Delete this lead?</h2>
        <p>
          <strong>{lead.name}</strong> will be permanently removed from your pipeline. This action
          cannot be undone.
        </p>

        {error ? <div className="form-alert" role="alert">{error}</div> : null}

        <div className="confirm-actions">
          <button type="button" className="button button-ghost" onClick={onClose} disabled={busy}>
            Keep lead
          </button>
          <button type="button" className="button button-danger" onClick={handleConfirm} disabled={busy}>
            {busy ? <Loader2 size={17} className="spin" /> : <Trash2 size={17} />}
            {busy ? 'Deleting…' : 'Delete lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
