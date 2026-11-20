import {
  ArrowUpDown,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Mail,
  Pencil,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react';
import { avatarTone, formatDate, getInitials } from '../utils/format.js';
import EmptyState from './EmptyState.jsx';
import StatusBadge from './StatusBadge.jsx';

function SortHeader({ field, label, sort, order, onSort }) {
  const active = sort === field;
  const Icon = active ? (order === 'asc' ? ChevronUp : ChevronDown) : ArrowUpDown;

  return (
    <button
      type="button"
      className={`sort-button ${active ? 'active' : ''}`}
      onClick={() => onSort(field)}
    >
      {label}
      <Icon size={13} />
    </button>
  );
}

function LeadActions({ lead, onEdit, onDelete }) {
  return (
    <div className="row-actions">
      <button
        type="button"
        className="icon-button row-action"
        onClick={() => onEdit(lead)}
        title={`Edit ${lead.name}`}
      >
        <Pencil size={16} />
        <span className="sr-only">Edit {lead.name}</span>
      </button>
      <button
        type="button"
        className="icon-button row-action danger"
        onClick={() => onDelete(lead)}
        title={`Delete ${lead.name}`}
      >
        <Trash2 size={16} />
        <span className="sr-only">Delete {lead.name}</span>
      </button>
    </div>
  );
}

function TableSkeleton() {
  return Array.from({ length: 6 }, (_, index) => (
    <tr key={index} className="skeleton-row">
      <td>
        <div className="lead-cell">
          <span className="skeleton skeleton-avatar" />
          <div className="stack">
            <span className="skeleton skeleton-text wide" />
            <span className="skeleton skeleton-text narrow" />
          </div>
        </div>
      </td>
      <td><span className="skeleton skeleton-text medium" /></td>
      <td><span className="skeleton skeleton-text medium" /></td>
      <td><span className="skeleton skeleton-pill" /></td>
      <td><span className="skeleton skeleton-pill" /></td>
      <td><span className="skeleton skeleton-text medium" /></td>
      <td><span className="skeleton skeleton-icon" /></td>
    </tr>
  ));
}

export default function LeadTable({
  leads,
  loading,
  sort,
  order,
  onSort,
  onEdit,
  onDelete,
  onAdd,
  onClearFilters,
  hasFilters,
}) {
  if (!loading && leads.length === 0) {
    return (
      <EmptyState
        filtered={hasFilters}
        title={hasFilters ? 'No leads match those filters' : 'Your pipeline starts here'}
        description={
          hasFilters
            ? 'Try a different name or status, or clear the filters to see your full pipeline.'
            : 'Add your first lead and start turning opportunities into conversations.'
        }
        action={
          hasFilters ? (
            <button type="button" className="button button-secondary" onClick={onClearFilters}>
              Clear filters
            </button>
          ) : (
            <button type="button" className="button button-primary" onClick={onAdd}>
              <Plus size={17} />
              Add your first lead
            </button>
          )
        }
      />
    );
  }

  return (
    <>
      <div className="table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th><SortHeader field="name" label="Lead" sort={sort} order={order} onSort={onSort} /></th>
              <th><SortHeader field="company" label="Company" sort={sort} order={order} onSort={onSort} /></th>
              <th>Contact</th>
              <th>Source</th>
              <th><SortHeader field="status" label="Status" sort={sort} order={order} onSort={onSort} /></th>
              <th><SortHeader field="createdAt" label="Added" sort={sort} order={order} onSort={onSort} /></th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton />
            ) : (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="lead-cell">
                      <div className={`avatar avatar-${avatarTone(lead.name)}`}>
                        {getInitials(lead.name)}
                      </div>
                      <div className="lead-identity">
                        <strong>{lead.name}</strong>
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="company-name">{lead.company}</span>
                  </td>
                  <td>
                    <a className="phone-link" href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}>
                      {lead.phone}
                    </a>
                  </td>
                  <td><span className="source-pill">{lead.source}</span></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><span className="date-cell">{formatDate(lead.createdAt)}</span></td>
                  <td>
                    <LeadActions lead={lead} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mobile-leads">
        {loading
          ? Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="lead-card skeleton-card">
                <span className="skeleton skeleton-avatar" />
                <div className="stack">
                  <span className="skeleton skeleton-text wide" />
                  <span className="skeleton skeleton-text medium" />
                  <span className="skeleton skeleton-text narrow" />
                </div>
              </div>
            ))
          : leads.map((lead) => (
              <article key={lead.id} className="lead-card">
                <div className="lead-card-head">
                  <div className={`avatar avatar-${avatarTone(lead.name)}`}>
                    {getInitials(lead.name)}
                  </div>
                  <div className="lead-card-title">
                    <strong>{lead.name}</strong>
                    <span>{lead.company}</span>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>

                <div className="lead-card-details">
                  <a href={`mailto:${lead.email}`}>
                    <Mail size={15} />
                    {lead.email}
                  </a>
                  <a href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}>
                    <Phone size={15} />
                    {lead.phone}
                  </a>
                  <span>
                    <CalendarDays size={15} />
                    Added {formatDate(lead.createdAt)}
                  </span>
                </div>

                <div className="lead-card-foot">
                  <span className="source-pill">{lead.source}</span>
                  <LeadActions lead={lead} onEdit={onEdit} onDelete={onDelete} />
                </div>
              </article>
            ))}
      </div>
    </>
  );
}
