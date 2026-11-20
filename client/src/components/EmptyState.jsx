import { Inbox } from 'lucide-react';

export default function EmptyState({ title, description, action, filtered }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Inbox size={25} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div className="empty-action">{action}</div> : null}
      {filtered ? <span className="empty-hint">Tip: clear the search and status filter to see everything.</span> : null}
    </div>
  );
}
