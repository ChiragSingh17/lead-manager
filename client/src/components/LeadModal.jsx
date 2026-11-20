import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, UserRound, X } from 'lucide-react';
import { LEAD_SOURCES, LEAD_STATUSES } from '../utils/constants.js';
import { getApiError, getFieldErrors, validateLead } from '../utils/validation.js';

const blankLead = {
  name: '',
  email: '',
  phone: '',
  company: '',
  source: 'Website',
  status: 'New',
};

export default function LeadModal({ lead, onClose, onSave }) {
  const [values, setValues] = useState(() =>
    lead
      ? {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          source: lead.source,
          status: lead.status,
        }
      : blankLead,
  );
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !saving) onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, saving]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setServerError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLead(values);

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    setServerError('');

    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        company: values.company.trim(),
      });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setServerError(getApiError(error, 'Could not save this lead. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  const isEditing = Boolean(lead);

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title">
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-icon">
              <UserRound size={20} />
            </span>
            <div>
              <h2 id="lead-modal-title">{isEditing ? 'Edit lead' : 'Add a new lead'}</h2>
              <p>{isEditing ? 'Update contact details or move this lead forward.' : 'Capture the details you need for a thoughtful follow-up.'}</p>
            </div>
          </div>
          <button type="button" className="icon-button modal-close" onClick={onClose} disabled={saving}>
            <X size={19} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError ? (
              <div className="form-alert" role="alert">
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
            ) : null}

            <div className="form-grid">
              <div className="field">
                <label htmlFor="lead-name">Full name</label>
                <input
                  id="lead-name"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Mehta"
                  autoFocus
                  aria-invalid={Boolean(errors.name)}
                  className={errors.name ? 'invalid' : ''}
                />
                {errors.name ? <span className="field-error">{errors.name}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="lead-email">Email address</label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  placeholder="name@company.com"
                  aria-invalid={Boolean(errors.email)}
                  className={errors.email ? 'invalid' : ''}
                />
                {errors.email ? <span className="field-error">{errors.email}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="lead-phone">Phone number</label>
                <input
                  id="lead-phone"
                  name="phone"
                  type="tel"
                  value={values.phone}
                  onChange={handleChange}
                  placeholder="+91 98100 24518"
                  aria-invalid={Boolean(errors.phone)}
                  className={errors.phone ? 'invalid' : ''}
                />
                {errors.phone ? <span className="field-error">{errors.phone}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="lead-company">Company</label>
                <input
                  id="lead-company"
                  name="company"
                  value={values.company}
                  onChange={handleChange}
                  placeholder="e.g. Northstar Labs"
                  aria-invalid={Boolean(errors.company)}
                  className={errors.company ? 'invalid' : ''}
                />
                {errors.company ? <span className="field-error">{errors.company}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="lead-source">Lead source</label>
                <select
                  id="lead-source"
                  name="source"
                  value={values.source}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.source)}
                  className={errors.source ? 'invalid' : ''}
                >
                  {LEAD_SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
                {errors.source ? <span className="field-error">{errors.source}</span> : null}
              </div>

              <div className="field">
                <label htmlFor="lead-status">Status</label>
                <select
                  id="lead-status"
                  name="status"
                  value={values.status}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.status)}
                  className={errors.status ? 'invalid' : ''}
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status ? <span className="field-error">{errors.status}</span> : null}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="button button-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={saving}>
              {saving ? <Loader2 size={17} className="spin" /> : null}
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
